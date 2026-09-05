from core.supabase_client import supabase

print("=== stock_movements with company_id IS NULL ===")
resp = supabase.table("stock_movements").select("id, invoice_id, product_name, company_id").execute()
rows = [r for r in (resp.data or []) if r.get("company_id") is None]
print(f"Total NULL rows: {len(rows)}")
for r in rows:
    print(r)

print("\n=== inventory with company_id IS NULL ===")
resp2 = supabase.table("inventory").select("id, product_name, company_id, last_updated").execute()
rows2 = [r for r in (resp2.data or []) if r.get("company_id") is None]
print(f"Total NULL rows: {len(rows2)}")
for r in rows2:
    print(r)
