from core.supabase_client import supabase

target_company = "f7422a77-fd0a-4135-9d56-beef58ed7b26"
corrupted_invoice_ids = [
    "08fec2cd-6cc3-45e8-9407-9fd7dbfd993f",
    "b91f1851-c7aa-4695-b1ea-7b50d8086f7a",
]

# Get the quantities that were incorrectly added
print("=== OCR data from affected invoices ===")
for inv_id in corrupted_invoice_ids:
    inv_resp = supabase.table("invoices").select("id, company_id, vendor_name, created_at").eq("id", inv_id).execute()
    inv_rows = inv_resp.data or []
    if not inv_rows:
        continue
    inv = inv_rows[0]
    print(f"\nInvoice {inv_id}: vendor={inv.get('vendor_name')}, company_id={inv.get('company_id')}, created_at={inv.get('created_at')}")

# Check current state of corrupted inventory rows
print("\n=== Corrupted inventory rows in OTHER company ===")
corrupted_ids = [
    "2bfa3b53-ef45-431b-93c4-e3754db5baea",
    "85001a71-b2dc-46a5-bc5c-1e50f5bd2188",
    "56b95882-ba6a-42d8-91bc-1ba75eaf3e2e",
    "c86d3612-17d3-4bb9-8efe-16477c57a0d3",
]
for cid in corrupted_ids:
    resp = supabase.table("inventory").select("id, product_name, quantity, company_id, last_updated").eq("id", cid).execute()
    rows = resp.data or []
    if rows:
        r = rows[0]
        print(f"  {r['product_name']}: qty={r['quantity']}, company_id={r['company_id']}, last_updated={r.get('last_updated')}")

# Check stock_movements for the OTHER company to see if they also got corrupted movements
print("\n=== stock_movements for OTHER company (f7422a77...) ===")
sm_resp = supabase.table("stock_movements").select("id, invoice_id, product_name, quantity_added, movement_type, created_at, company_id").eq("company_id", target_company).execute()
sm_rows = sm_resp.data or []
print(f"Total stock_movements for company {target_company}: {len(sm_rows)}")
for r in sm_rows:
    if r.get("invoice_id") in corrupted_invoice_ids:
        print(f"  ⚠️ CORRUPTED: id={r['id']}, invoice_id={r['invoice_id']}, product={r['product_name']}, qty_added={r['quantity_added']}, movement_type={r['movement_type']}, created_at={r.get('created_at')}")
