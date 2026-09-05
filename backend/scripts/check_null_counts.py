from core.supabase_client import supabase

resp1 = supabase.table("inventory").select("*").execute()
inv_rows = resp1.data or []
inv_null = sum(1 for r in inv_rows if r.get("company_id") is None)

resp2 = supabase.table("stock_movements").select("*").execute()
sm_rows = resp2.data or []
sm_null = sum(1 for r in sm_rows if r.get("company_id") is None)

print(f"inventory NULL count: {inv_null}")
print(f"stock_movements NULL count: {sm_null}")
