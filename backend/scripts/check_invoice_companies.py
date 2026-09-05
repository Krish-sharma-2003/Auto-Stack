from core.supabase_client import supabase

target_invoices = [
    "b91f1851-c7aa-4695-b1ea-7b50d8086f7a",
    "08fec2cd-6cc3-45e8-9407-9fd7dbfd993f",
    "30591d36-bbec-4d8e-92f6-d543fd0cf9c8",
]

for inv_id in target_invoices:
    resp = supabase.table("invoices").select("id, company_id, invoice_number, vendor_name, created_at").eq("id", inv_id).execute()
    rows = resp.data or []
    print(f"\nInvoice {inv_id}:")
    if rows:
        for r in rows:
            print(f"  company_id={r.get('company_id')}, vendor={r.get('vendor_name')}, number={r.get('invoice_number')}, created_at={r.get('created_at')}")
    else:
        print("  NOT FOUND in invoices table")
