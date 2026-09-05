from fastapi import APIRouter, UploadFile, File, HTTPException, Query, Header
from services.ocr_service import parse_invoice_image, parse_invoice_pdf
from services.gstin_service import run_gstin_checks
from services.inventory_service import update_stock_from_invoice
from core.supabase_client import supabase
from core.auth import _get_user_from_header, _require_active_membership
from datetime import datetime
import uuid
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
async def upload_invoice(company_id: str = Query(...), authorization: str | None = Header(None), file: UploadFile = File(...)):
    user = _get_user_from_header(authorization)
    _require_active_membership(user["id"], company_id)
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
            "stock_updated": False,
            "reason": "Stock update skipped due to CRITICAL risk",
            "message": "Invoice blocked due to critical validation failures",
            "gstin_report": gstin_report,
            "invoice_data": invoice_data
        }

    # ── Step 4: Save invoice record to Supabase ────────────────────────
    invoice_id = str(uuid.uuid4())
    vendor_name = invoice_data.get("vendor_name")
    normalized_gstin = gstin.strip().upper() if gstin else None
    vendor_state = gstin_report["format_check"].get("state_name")

    # Create vendor only when OCR provided both a vendor name and GSTIN.
    # GSTIN is the stable unique lookup key, so re-uploading an invoice
    # from the same vendor will not create a duplicate vendor.
    if vendor_name and normalized_gstin:
        existing_vendor = supabase.table("vendors") \
            .select("id") \
            .eq("gstin", normalized_gstin) \
            .limit(1) \
            .execute()

        if not existing_vendor.data:
            supabase.table("vendors").insert({
                "company_id": company_id,
                "name": vendor_name,
                "gstin": normalized_gstin,
                "address": vendor_address or None,
                "state": vendor_state
            }).execute()

    supabase.table("invoices").insert({
        "id": invoice_id,
        "company_id": company_id,
        "vendor_name": vendor_name,
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
    stock_updated = False
    stock_reason = None

    if risk_level in ["NONE", "LOW"]:
        stock_update = await update_stock_from_invoice(invoice_data, invoice_id, company_id)
        item_errors = [
            result for result in stock_update.get("results", [])
            if result.get("action") == "ERROR"
        ]
        stock_updated = (
            stock_update.get("success", False)
            and stock_update.get("updated_items", 0) > 0
            and not item_errors
        )
        if not stock_updated:
            stock_reason = (
                stock_update.get("error")
                or "; ".join(error.get("error", "Stock update failed") for error in item_errors)
                or "No valid invoice items were updated"
            )
    else:
        stock_reason = f"Stock update skipped due to {risk_level} risk"

    # ── Final Response ─────────────────────────────────────────────────
    return {
        "success": stock_updated,
        "invoice_id": invoice_id,
        "status": "MANUAL_REVIEW" if risk_level in ["HIGH", "MEDIUM"] else "PROCESSED",
        "invoice_data": invoice_data,
        "gstin_report": gstin_report,
        "stock_update": stock_update,
        "stock_updated": stock_updated,
        "reason": stock_reason,
        "message": (
            "Invoice processed and stock updated successfully"
            if stock_updated
            else f"Invoice processed, but stock was not updated — {stock_reason}"
        )
    }


@router.get("/")
async def get_all_invoices(company_id: str = Query(...), authorization: str | None = Header(None)):
    user = _get_user_from_header(authorization)
    _require_active_membership(user["id"], company_id)
    try:
        response = supabase.table("invoices") \
            .select("*") \
            .eq("company_id", company_id) \
            .order("created_at", desc=True) \
            .execute()
        return {"success": True, "invoices": response.data}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
