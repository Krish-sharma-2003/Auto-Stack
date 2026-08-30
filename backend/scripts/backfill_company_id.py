from core.supabase_client import supabase

TARGET_EMAIL = "krish.sharma.cse.2023@miet.ac.in"

print(f"Looking up auth user for: {TARGET_EMAIL}")
user_resp = supabase.auth.admin.list_users()
users_list = user_resp if isinstance(user_resp, list) else getattr(user_resp, "users", [])
target_user = None
for u in users_list:
    if u.email and u.email.lower() == TARGET_EMAIL.lower():
        target_user = u
        break

if not target_user:
    print(f"User not found in auth.users for email: {TARGET_EMAIL}")
    exit(1)

user_id = target_user.id
print(f"Found user_id: {user_id}")

print("Looking up company for user...")
cu_resp = supabase.table("company_users").select("company_id, role, status, companies(*)").eq("user_id", user_id).limit(1).execute()

company = None
if cu_resp.data:
    company = cu_resp.data[0].get("companies")
    company_id = cu_resp.data[0]["company_id"]
    print(f"Found company_id via company_users: {company_id}")
    print(f"Company name: {company.get('name') if company else 'N/A'}")
else:
    comp_resp = supabase.table("companies").select("id, name").eq("owner_id", user_id).limit(1).execute()
    if comp_resp.data:
        company = comp_resp.data[0]
        company_id = company["id"]
        print(f"Found company_id via companies.owner_id: {company_id}")
        print(f"Company name: {company.get('name')}")
    else:
        print("No company found for this user in either company_users or companies")
        exit(1)

tables = [
    "inventory",
    "invoices",
    "sales_invoices",
    "challans",
    "vendors",
    "parties",
    "stock_movements",
]

for table in tables:
    rows_resp = supabase.table(table).select("*").execute()
    rows = rows_resp.data or []
    null_rows = [r for r in rows if r.get("company_id") is None]
    print(f"\n{table}: {len(null_rows)} rows with company_id = NULL (out of {len(rows)} total)")

    for row in null_rows:
        update_resp = supabase.table(table).update({"company_id": company_id}).eq("id", row["id"]).execute()
        if hasattr(update_resp, "data") and update_resp.data:
            print(f"  Updated {table} row {row['id']}")
        else:
            print(f"  WARNING: update failed for {table} row {row['id']}")

print("\nBackfill complete.")
