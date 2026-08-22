from core.supabase_client import supabase
from datetime import datetime
import re


def normalize_product_name(product_name: str) -> str:
    return re.sub(r"\s+", " ", product_name.strip())


async def update_stock_from_invoice(invoice_data: dict, invoice_id: str) -> dict:
    """
    After invoice is parsed and verified, update stock levels in Supabase.
    
    Flow:
    1. Loop through each item in invoice
    2. Check if product exists in inventory
    3. If yes → increase quantity
    4. If no → create new product entry
    5. Log the stock movement
    """
    items = invoice_data.get("items", [])
    
    if not items:
        return {
            "success": False,
            "error": "No items found in invoice to update stock"
        }

    results = []

    for item in items:
        product_name = normalize_product_name(item.get("name", ""))
        quantity = item.get("quantity", 0)
        unit = item.get("unit", "pcs")
        unit_price = item.get("unit_price") or item.get("rate") or 0

        if not product_name or quantity <= 0:
            continue

        try:
            # Check if product already exists in inventory
            existing = supabase.table("inventory") \
                .select("*") \
                .ilike("product_name", normalize_product_name(product_name)) \
                .execute()

            if existing.data:
                # Product exists → update quantity
                product = existing.data[0]
                new_quantity = product["quantity"] + quantity

                supabase.table("inventory") \
                    .update({
                        "quantity": new_quantity,
                        "last_updated": datetime.utcnow().isoformat(),
                        "unit_price": unit_price  # update to latest price
                    }) \
                    .eq("id", product["id"]) \
                    .execute()

                results.append({
                    "product": product_name,
                    "action": "UPDATED",
                    "previous_qty": product["quantity"],
                    "added_qty": quantity,
                    "new_qty": new_quantity
                })

            else:
                # New product → insert into inventory
                supabase.table("inventory") \
                    .insert({
                        "product_name": product_name,
                        "quantity": quantity,
                        "unit": unit,
                        "unit_price": unit_price,
                        "last_updated": datetime.utcnow().isoformat()
                    }) \
                    .execute()

                results.append({
                    "product": product_name,
                    "action": "CREATED",
                    "new_qty": quantity
                })

            # Log stock movement (audit trail)
            supabase.table("stock_movements") \
                .insert({
                    "invoice_id": invoice_id,
                    "product_name": product_name,
                    "quantity_added": quantity,
                    "movement_type": "PURCHASE",
                    "created_at": datetime.utcnow().isoformat()
                }) \
                .execute()

        except Exception as e:
            results.append({
                "product": product_name,
                "action": "ERROR",
                "error": str(e)
            })

    return {
        "success": True,
        "updated_items": len([r for r in results if r["action"] in ["UPDATED", "CREATED"]]),
        "results": results
    }


async def get_inventory() -> dict:
    """
    Fetch all inventory items with low stock alerts.
    Low stock = quantity less than 10 (can be made configurable)
    """
    try:
        response = supabase.table("inventory") \
            .select("*") \
            .order("product_name") \
            .execute()

        items = response.data
        low_stock = [item for item in items if item.get("quantity", 0) < 10]

        return {
            "success": True,
            "total_products": len(items),
            "low_stock_count": len(low_stock),
            "items": items,
            "low_stock_alerts": low_stock
        }

    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }
