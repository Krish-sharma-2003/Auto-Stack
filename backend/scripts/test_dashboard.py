import sys
sys.path.insert(0, '/home/krish/Desktop/smart-inventory/backend')

import traceback
import asyncio
from core.supabase_client import supabase
from services.inventory_service import get_inventory
from datetime import datetime, timedelta

COMPANY_ID = "d48006f1-0716-4332-90f0-5660e8c3a276"

async def main():
    print("=== STEP 1: get_inventory ===")
    try:
        result = await get_inventory(COMPANY_ID)
        print(f"Type: {type(result)}")
        print(f"Keys: {list(result.keys()) if isinstance(result, dict) else 'N/A'}")
        if isinstance(result, dict):
            print(f"success: {result.get('success')}")
            print(f"total_products: {result.get('total_products')}")
            print(f"low_stock_count: {result.get('low_stock_count')}")
            print(f"items count: {len(result.get('items', []))}")
            print(f"low_stock_alerts count: {len(result.get('low_stock_alerts', []))}")
            print(f"First item sample: {result.get('items', [{}])[0] if result.get('items') else 'N/A'}")
    except Exception:
        print("FAILED:")
        traceback.print_exc()

    print("\n=== STEP 2: invoices query ===")
    try:
        inv_data = supabase.table("invoices").select("*").eq("company_id", COMPANY_ID).order("created_at", desc=True).execute()
        all_invoices = inv_data.data or []
        print(f"Total invoices: {len(all_invoices)}")
        if all_invoices:
            print(f"First invoice: {all_invoices[0]}")
            print(f"Last invoice: {all_invoices[-1]}")
    except Exception:
        print("FAILED:")
        traceback.print_exc()

    print("\n=== STEP 3: _is_this_month logic ===")
    try:
        now = datetime.utcnow()
        test_dates = [
            "2026-09-05T10:00:00Z",
            "2026-08-01T10:00:00Z",
            None,
            "",
            "invalid-date",
        ]
        for ts in test_dates:
            if ts:
                d = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                result = d.month == now.month and d.year == now.year
            else:
                result = False
            print(f"  ts={ts!r} -> this_month={result}")
    except Exception:
        print("FAILED:")
        traceback.print_exc()

    print("\n=== STEP 4: volume grouping ===")
    try:
        now = datetime.utcnow()
        thirty_days_ago = now - timedelta(days=30)
        inv_data = supabase.table("invoices").select("*").eq("company_id", COMPANY_ID).order("created_at", desc=True).execute()
        all_invoices = inv_data.data or []

        recent_for_chart = []
        for iv in all_invoices:
            ts = iv.get("created_at")
            if ts:
                try:
                    d = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                    if d >= thirty_days_ago:
                        recent_for_chart.append(iv)
                except Exception as e:
                    print(f"  WARNING: bad timestamp {ts!r}: {e}")

        print(f"Invoices in last 30 days: {len(recent_for_chart)}")

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
        for pt in invoice_volume_30d[:5]:
            print(f"  {pt}")
    except Exception:
        print("FAILED:")
        traceback.print_exc()

    print("\n=== STEP 5: top products + risk distribution ===")
    try:
        inv_result = await get_inventory(COMPANY_ID)
        items = inv_result.get("items", [])
        all_invoices = supabase.table("invoices").select("*").eq("company_id", COMPANY_ID).execute().data or []

        top_products = sorted(
            [{"name": item.get("product_name", ""), "value": (item.get("quantity", 0) or 0) * (item.get("unit_price") or 0)} for item in items],
            key=lambda x: x["value"],
            reverse=True,
        )[:5]
        print(f"Top products: {top_products}")

        risk_counts = {"NONE": 0, "LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        for iv in all_invoices:
            risk = iv.get("risk_level", "NONE")
            if risk in risk_counts:
                risk_counts[risk] += 1
        print(f"Risk counts: {risk_counts}")
    except Exception:
        print("FAILED:")
        traceback.print_exc()

asyncio.run(main())

