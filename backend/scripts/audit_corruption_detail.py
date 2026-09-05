from core.supabase_client import supabase

corrupted_invoice_ids = [
    "08fec2cd-6cc3-45e8-9407-9fd7dbfd993f",
    "b91f1851-c7aa-4695-b1ea-7b50d8086f7a",
    "30591d36-bbec-4d8e-92f6-d543fd0cf9c8",
]

print("=== stock_movements with NULL company_id for affected invoices ===")
resp = supabase.table("stock_movements").select("id, invoice_id, product_name, quantity_added, movement_type, created_at, company_id").execute()
rows = resp.data or []
null_rows = [r for r in rows if r.get("company_id") is None and r.get("invoice_id") in corrupted_invoice_ids]

for r in null_rows:
    print(f"  id={r['id']}, invoice_id={r['invoice_id']}, product={r['product_name']}, qty_added={r['quantity_added']}, type={r['movement_type']}, created_at={r.get('created_at')}")

print(f"\nTotal: {len(null_rows)} corrupted stock_movements")

# Also check the invoice data to see the exact quantities
print("\n=== Invoice OCR item quantities ===")
for inv_id in corrupted_invoice_ids:
    inv_resp = supabase.table("invoices").select("id, company_id, vendor_name, created_at").eq("id", inv_id).execute()
    inv_rows = inv_resp.data or []
    if inv_rows:
        inv = inv_rows[0]
        print(f"\nInvoice {inv_id}: vendor={inv.get('vendor_name')}, company_id={inv.get('company_id')}")
