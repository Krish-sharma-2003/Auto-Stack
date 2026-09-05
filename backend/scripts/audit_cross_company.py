from core.supabase_client import supabase

products = ['DEBISTAL-GM TAB', 'FLUSID- B', 'RABITOP DSR (ALU-ALU)', 'Makhana']
target_company = "d48006f1-0716-4332-90f0-5660e8c3a276"
suspect_window_start = "2026-09-05T06:00:00Z"
suspect_window_end = "2026-09-05T09:30:00Z"

print("=== Inventory audit for cross-company corruption ===")
for product in products:
    resp = supabase.table("inventory").select("id, product_name, quantity, company_id, last_updated") \
        .ilike("product_name", product).execute()
    rows = resp.data or []
    matches = [r for r in rows if product.lower() in r.get("product_name", "").lower()]
    if not matches:
        continue

    print(f"\nProduct: {product}")
    for r in matches:
        is_target = r["company_id"] == target_company
        in_window = suspect_window_start <= (r.get("last_updated") or "") < suspect_window_end
        flag = ""
        if not is_target and in_window:
            flag = " ⚠️ CROSS-COMPANY SUSPECT"
        elif not is_target:
            flag = " [other company]"
        print(f"  id={r['id']}, qty={r['quantity']}, company_id={r['company_id']}, last_updated={r.get('last_updated')}{flag}")
