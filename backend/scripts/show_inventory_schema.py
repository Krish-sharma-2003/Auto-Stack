from core.supabase_client import supabase

print("=== Inventory table schema ===")
# Get one existing row to see all columns
resp = supabase.table("inventory").select("*").limit(1).execute()
if resp.data:
    row = resp.data[0]
    print("Columns and sample values:")
    for key, value in row.items():
        print(f"  {key}: {value!r}")
else:
    print("No rows found")

# Also check specifically for the products we need to insert
print("\n=== Existing rows for target products (old company) ===")
products = ['DEBISTAL-GM TAB', 'FLUSID- B', 'RABITOP DSR (ALU-ALU)', 'Makhana']
for product in products:
    resp2 = supabase.table("inventory").select("*").ilike("product_name", product).execute()
    rows = resp2.data or []
    matches = [r for r in rows if product.lower() in r.get("product_name", "").lower()]
    if matches:
        print(f"\n{product}:")
        for r in matches:
            print(f"  {r}")
