from fastapi import APIRouter, UploadFile, File, HTTPException
from services.ocr_service import parse_invoice_image, parse_invoice_pdf
from services.gstin_service import run_gstin_checks
from services.inventory_service import update_stock_from_invoice
from core.supabase_client import supabase
from datetime import datetime
import uuid
# Ye function add karo file ke top pe, imports ke baad
from datetime import datetime

def parse_date(date_str):
    if not date_str:
        return None
    for fmt in ["%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y"]:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except:
            continue
    return None  # agar koi format match nahi kiya 
router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg", "application/pdf"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_invoice(file: UploadFile = File(...)):
    """
    Main endpoint — full pipeline:
    1. Validate file
    2. OCR parse with Gemini Vision
    3. GSTIN validation
    4. Save invoice to Supabase
    5. Auto-update inventory stock
    """

    # ── Step 1: Validate file ──────────────────────────────────────────
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{file.content_type}'. Allowed: JPG, PNG, PDF"
        )

    file_bytes = await file.read()

    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large. Maximum size is 10MB"
        )

    # ── Step 2: OCR — Parse invoice with Gemini ────────────────────────
    if file.content_type == "application/pdf":
        ocr_result = await parse_invoice_pdf(file_bytes)
    else:
        ocr_result = await parse_invoice_image(file_bytes)

    if not ocr_result["success"]:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse invoice: {ocr_result['error']}"
        )

    invoice_data = ocr_result["data"]

    # ── Step 3: GSTIN Validation ───────────────────────────────────────
    gstin = invoice_data.get("vendor_gstin") or invoice_data.get("gstin")
    vendor_address = invoice_data.get("vendor_address", "")

    gstin_report = run_gstin_checks(gstin, vendor_address)
    risk_level = gstin_report["risk_assessment"]["level"]

    # Block if CRITICAL risk
    if risk_level == "CRITICAL":
        return {
            "success": False,
            "status": "BLOCKED",
            "message": "Invoice blocked due to critical validation failures",
            "gstin_report": gstin_report,
            "invoice_data": invoice_data
        }

    # ── Step 4: Save invoice record to Supabase ────────────────────────
    invoice_id = str(uuid.uuid4())

    supabase.table("invoices").insert({
        "id": invoice_id,
        "vendor_name": invoice_data.get("vendor_name"),
        "vendor_gstin": gstin,
        "vendor_address": vendor_address,
        "invoice_number": invoice_data.get("invoice_number"),
        "invoice_date": parse_date(invoice_data.get("invoice_date")),
        "total_amount": invoice_data.get("total_amount"),
        "risk_level": risk_level,
        "status": "MANUAL_REVIEW" if risk_level in ["HIGH", "MEDIUM"] else "PROCESSED",
        "created_at": datetime.utcnow().isoformat()
    }).execute()

    # ── Step 5: Auto-update inventory (skip if HIGH risk) ─────────────
    stock_update = None
    if risk_level in ["NONE", "LOW"]:
        stock_update = await update_stock_from_invoice(invoice_data, invoice_id)

    # ── Final Response ─────────────────────────────────────────────────
    return {
        "success": True,
        "invoice_id": invoice_id,
        "status": "MANUAL_REVIEW" if risk_level in ["HIGH", "MEDIUM"] else "PROCESSED",
        "invoice_data": invoice_data,
        "gstin_report": gstin_report,
        "stock_update": stock_update,
        "message": (
            "Invoice processed and stock updated successfully"
            if risk_level == "NONE"
            else f"Invoice flagged for manual review — Risk: {risk_level}"
        )
    }


@router.get("/")
async def get_all_invoices():
    """Get all invoices from database"""
    try:
        response = supabase.table("invoices") \
            .select("*") \
            .order("created_at", desc=True) \
            .execute()
        return {"success": True, "invoices": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
