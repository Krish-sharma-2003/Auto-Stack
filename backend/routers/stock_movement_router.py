from fastapi import APIRouter, HTTPException

from core.supabase_client import supabase


router = APIRouter(prefix="/api/stock-movements", tags=["Stock Movements"])


@router.get("/")
async def get_stock_movements():
    """Return movement history with a readable purchase/sales invoice reference."""
    try:
        response = (
            supabase.table("stock_movements")
            .select("id, invoice_id, product_name, quantity_added, movement_type, created_at")
            .order("created_at", desc=True)
            .execute()
        )

        movements = []
        for movement in response.data or []:
            invoice_id = movement.get("invoice_id")
            invoice_ref = invoice_id

            if invoice_id:
                purchase_invoice = (
                    supabase.table("invoices")
                    .select("invoice_number")
                    .eq("id", invoice_id)
                    .limit(1)
                    .execute()
                )

                if purchase_invoice.data:
                    invoice_ref = purchase_invoice.data[0].get("invoice_number") or invoice_id
                else:
                    sales_invoice = (
                        supabase.table("sales_invoices")
                        .select("invoice_no")
                        .eq("id", invoice_id)
                        .limit(1)
                        .execute()
                    )
                    if sales_invoice.data:
                        invoice_ref = sales_invoice.data[0].get("invoice_no") or invoice_id

            movements.append({
                **movement,
                "invoice_ref": invoice_ref,
            })

        return {"success": True, "movements": movements}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))