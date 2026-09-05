from core.supabase_client import supabase

target_company = "d48006f1-0716-4332-90f0-5660e8c3a276"
old_company = "f7422a77-fd0a-4135-9d56-beef58ed7b26"

print("=== STEP 3a: Revert old company's wrongly-incremented quantities ===")
updates_3a = [
    ("2bfa3b53-ef45-431b-93c4-e3754db5baea", 10, "DEBISTAL-GM TAB"),
    ("85001a71-b2dc-46a5-bc5c-1e50f5bd2188", 25, "FLUSID- B"),
    ("56b95882-ba6a-42d8-91bc-1ba75eaf3e2e", 20, "RABITOP DSR (ALU-ALU)"),
    ("c86d3612-17d3-4bb9-8efe-16477c57a0d3", 104, "Makhana"),
]
for row_id, subtract, product in updates_3a:
    # Get current qty first
    resp = supabase.table("inventory").select("quantity").eq("id", row_id).execute()
    current = (resp.data or [{}])[0].get("quantity", 0)
    new_qty = current - subtract
    print(f"  {product}: {current} - {subtract} = {new_qty}")
    upd = supabase.table("inventory").update({"quantity": new_qty}).eq("id", row_id).execute()
    print(f"    Updated: {upd.data}")

print("\n=== STEP 3b: Create test company's inventory rows for GROUP A ===")
inserts_3b = [
    ("DEBISTAL-GM TAB", 10, "", 25.5),
    ("FLUSID- B", 25, "", 16.5),
    ("RABITOP DSR (ALU-ALU)", 20, "", 14.5),
    ("Makhana", 104, "KGS", 500.0),
]
for product_name, qty, unit, unit_price in inserts_3b:
    import uuid
    row_id = str(uuid.uuid4())
    data = {
        "id": row_id,
        "product_name": product_name,
        "quantity": qty,
        "unit": unit,
        "unit_price": unit_price,
        "company_id": target_company,
        "last_updated": "2026-09-05T10:15:00Z",
    }
    resp = supabase.table("inventory").insert(data).execute()
    print(f"  Inserted {product_name}: id={row_id}, qty={qty}")
    print(f"    Result: {resp.data}")

print("\n=== STEP 3c: Assign company_id to GROUP B orphan rows ===")
updates_3c = [
    ("6556b019-2c91-4025-9f4d-f3cf7e75f98d", "Makhana Classic"),
    ("a80869aa-72a1-4374-84bc-4727c577d7ff", "Makhana Premium"),
]
for row_id, product in updates_3c:
    resp = supabase.table("inventory").update({"company_id": target_company}).eq("id", row_id).execute()
    print(f"  Updated {product} ({row_id}): {resp.data}")

print("\n=== STEP 3d: Assign company_id to corrupted stock_movements ===")
movement_ids = [
    "847b4d3c-28f0-4654-b8cc-da5ad452fb7f",
    "c2e7a163-286a-4aeb-a021-5c2415217eac",
    "5591dc1d-ed72-4a02-9502-bbbca7139276",
    "39e38517-11df-4c15-810a-8f062760a002",
    "5ef81afe-73bc-4247-9412-7a2022fe077d",
    "a467549d-5ecd-49ba-b80c-9e6d431f5540",
]
resp = supabase.table("stock_movements").update({"company_id": target_company}).in_("id", movement_ids).execute()
print(f"  Updated {len(movement_ids)} stock_movements to company {target_company}")
print(f"  Result count: {len(resp.data or [])}")

print("\n=== STEP 3 complete ===")
