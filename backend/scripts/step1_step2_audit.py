from core.supabase_client import supabase

print("=== STEP 1: Row identity for the 2 Makhana inventory rows ===")
ids = [
    "6556b019-2c91-4025-9f4d-f3cf7e75f98d",
    "a80869aa-72a1-4374-84bc-4727c577d7ff",
]
resp = supabase.table("inventory").select("id, product_name, company_id, quantity, last_updated").execute()
rows = resp.data or []
for r in rows:
    if r["id"] in ids:
        print(r)

print("\n=== STEP 2: stock_movements for affected products ===")
products = ['DEBISTAL-GM TAB', 'FLUSID- B', 'RABITOP DSR (ALU-ALU)', 'Makhana', 'Makhana Classic', 'Makhana Premium']
resp2 = supabase.table("stock_movements").select("id, product_name, quantity_added, movement_type, created_at, company_id").execute()
all_rows = resp2.data or []
matched = [r for r in all_rows if r.get("product_name") in products]
for r in matched:
    print(r)
