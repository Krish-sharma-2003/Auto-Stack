import sys
sys.path.insert(0, '/home/krish/Desktop/smart-inventory/backend')

import traceback
import asyncio
from datetime import datetime, timedelta, timezone
from core.supabase_client import supabase
from services.inventory_service import get_inventory

COMPANY_ID = "d48006f1-0716-4332-90f0-5660e8c3a276"

async def main():
    print("=== Testing FIXED dashboard logic ===")
    
    # Test the exact logic from dashboard_router.py
    inv_result = await get_inventory(COMPANY_ID)
    items = inv_result.get("items", [])
    total_products = len(items)
    low_stock_alerts = inv_result.get("low_stock_alerts", [])
    total_value = round(
        sum(
            (item.get("quantity", 0) or 0) * (item.get("unit_price") or 0)
            for item in items
        )
    )
    
    inv_data = supabase.table("invoices").select("*").eq("company_id", COMPANY_ID).order("created_at", desc=True).execute()
    all_invoices = inv_data.data or []
    
    now = datetime.now(timezone.utc)
    thirty_days_ago = now - timedelta(days=30)
    
    print(f"now (timezone-aware): {now}")
    print(f"thirty_days_ago: {thirty_days_ago}")
    print(f"Total invoices: {len(all_invoices)}")
    
    recent_for_chart = []
    for iv in all_invoices:
        ts = iv.get("created_at")
        if ts:
            try:
                d = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                if d >= thirty_days_ago:
                    recent_for_chart.append(iv)
                    print(f"  INCLUDED: {ts}")
                else:
                    print(f"  EXCLUDED (too old): {ts}")
            except Exception as e:
                print(f"  WARNING: bad timestamp {ts!r}: {e}")
    
    print(f"\nInvoices in last 30 days: {len(recent_for_chart)}")
    
    volume_by_date = {}
    for iv in recent_for_chart:
        d = (iv.get("created_at") or "")[:10]
        if d:
            volume_by_date[d] = volume_by_date.get(d, 0) + 1
    
    invoice_volume_30d = [
        {"date": d, "invoices": count}
        for d, count in sorted(volume_by_date.items())
    ]
    print(f"Volume data points: {len(invoice_volume_30d)}")
    for pt in invoice_volume_30d:
        print(f"  {pt}")
    
    print(f"\nSummary:")
    print(f"  total_products: {total_products}")
    print(f"  low_stock_count: {len(low_stock_alerts)}")
    print(f"  total_inventory_value: {total_value}")
    print(f"  invoices_this_month (approx): {len([iv for iv in all_invoices if datetime.fromisoformat(iv.get('created_at','').replace('Z','+00:00')).month == now.month and datetime.fromisoformat(iv.get('created_at','').replace('Z','+00:00')).year == now.year])}")
    print(f"  recent_invoices count: {len(all_invoices[:5])}")
    print(f"  risk_distribution: NONE={sum(1 for iv in all_invoices if iv.get('risk_level')=='NONE')}, LOW={sum(1 for iv in all_invoices if iv.get('risk_level')=='LOW')}, MEDIUM={sum(1 for iv in all_invoices if iv.get('risk_level')=='MEDIUM')}, HIGH={sum(1 for iv in all_invoices if iv.get('risk_level')=='HIGH')}, CRITICAL={sum(1 for iv in all_invoices if iv.get('risk_level')=='CRITICAL')}")

asyncio.run(main())
