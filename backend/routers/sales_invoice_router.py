from datetime import date, datetime
import logging
import uuid

from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel, Field

from core.supabase_client import supabase
from core.auth import _get_user_from_header, _require_active_membership
from services.inventory_service import normalize_product_name


router = APIRouter(prefix="/api/sales-invoices", tags=["Sales Invoices"])
logger = logging.getLogger(__name__)


class SaleItem(BaseModel):
    product_name: str = Field(min_length=1)
    quantity: float = Field(gt=0)
    unit: str = Field(min_length=1)
    rate: float = Field(ge=0)
    discount: float = Field(ge=0, le=100)
    amount: float = Field(ge=0)


class SalesInvoiceCreate(BaseModel):
    invoice_no: str = Field(min_length=1)
    party_name: str = Field(min_length=1)
    invoice_date: date
    items: list[SaleItem] = Field(min_length=1)
    subtotal: float = Field(ge=0)
    tax_amount: float = Field(ge=0)
    total_amount: float = Field(ge=0)


@router.post("")
async def create_sales_invoice(company_id: str = Query(...), authorization: str | None = Header(None), invoice: SalesInvoiceCreate = ...):
    user = _get_user_from_header(authorization)
    _require_active_membership(user["id"], company_id)
    invoice_id = str(uuid.uuid4())

    try:
        supabase.table("sales_invoices").insert({
            "id": invoice_id,
            "company_id": company_id,
            "invoice_no": invoice.invoice_no,
            "party_name": invoice.party_name,
            "invoice_date": invoice.invoice_date.isoformat(),
            "items": [item.model_dump() for item in invoice.items],
            "subtotal": invoice.subtotal,
            "tax_amount": invoice.tax_amount,
            "total_amount": invoice.total_amount,
        }).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save sales invoice: {str(exc)}"
        )

    results = []
    for item in invoice.items:
        product_name = normalize_product_name(item.product_name)
        inventory_updated = False
        available_qty = None
        try:
            existing = supabase.table("inventory") \
                .select("*") \
                .eq("company_id", company_id) \
                .ilike("product_name", product_name) \
                .execute()

            if not existing.data:
                results.append({
                    "product": product_name,
                    "action": "SKIPPED",
                    "reason": "Product not found in inventory",
                })
                continue

            product = existing.data[0]
            available_qty = product["quantity"]
            if available_qty < item.quantity:
                results.append({
                    "product": product_name,
                    "action": "SKIPPED",
                    "reason": (
                        f"Insufficient stock: available {available_qty}, "
                        f"requested {item.quantity}"
                    ),
                })
                continue

            new_quantity = available_qty - item.quantity
            supabase.table("inventory").update({
                "quantity": new_quantity,
                "last_updated": datetime.utcnow().isoformat(),
            }).eq("company_id", company_id).eq("id", product["id"]).execute()
            inventory_updated = True

            supabase.table("stock_movements").insert({
                "company_id": company_id,
                "invoice_id": invoice_id,
                "product_name": product_name,
                "quantity_added": -item.quantity,
                "movement_type": "SALE",
                "created_at": datetime.utcnow().isoformat(),
            }).execute()

            results.append({
                "product": product_name,
                "action": "SOLD",
                "previous_qty": available_qty,
                "sold_qty": item.quantity,
                "new_qty": new_quantity,
            })
        except Exception as exc:
            logger.exception(
                "Sales stock update failed: invoice_id=%s product=%r quantity=%s",
                invoice_id,
                product_name,
                item.quantity,
            )

            rollback_error = None
            if inventory_updated:
                try:
                    supabase.table("inventory").update({
                        "quantity": available_qty,
                        "last_updated": datetime.utcnow().isoformat(),
                    }).eq("company_id", company_id).eq("id", product["id"]).execute()
                except Exception as rollback_exc:
                    logger.exception(
                        "Sales inventory rollback failed: invoice_id=%s product=%r quantity=%s",
                        invoice_id,
                        product_name,
                        item.quantity,
                    )
                    rollback_error = str(rollback_exc)

            reason = str(exc)
            if inventory_updated and rollback_error is None:
                reason += " Inventory quantity was reverted."
            elif rollback_error:
                reason += f" Inventory rollback also failed: {rollback_error}"

            results.append({
                "product": product_name,
                "action": "ERROR",
                "reason": reason,
            })

    sold_count = len([item for item in results if item["action"] == "SOLD"])
    skipped_items = [item for item in results if item["action"] == "SKIPPED"]
    return {
        "success": True,
        "invoice_id": invoice_id,
        "sold_count": sold_count,
        "skipped_count": len(skipped_items),
        "results": results,
        "message": (
            f"{sold_count} items sold"
            + (f", {len(skipped_items)} skipped" if skipped_items else "")
        ),
    }
