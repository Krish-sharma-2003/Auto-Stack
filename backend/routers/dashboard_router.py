from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Query, Header

from core.supabase_client import supabase
from core.auth import _get_user_from_header, _require_active_membership
from services.inventory_service import get_inventory

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def _is_this_month(ts: str | None, now: datetime) -> bool:
    if not ts:
        return False
    try:
        d = datetime.fromisoformat(ts.replace("Z", "+00:00"))
        return d.month == now.month and d.year == now.year
    except Exception:
        return False


def _risk_color(risk: str) -> str:
    colors = {
        "NONE": "#10B981",
        "LOW": "#3B82F6",
        "MEDIUM": "#F59E0B",
        "HIGH": "#EF4444",
        "CRITICAL": "#991B1B",
    }
    return colors.get(risk, "#94A3B8")


@router.get("/summary")
async def get_dashboard_summary(company_id: str = Query(...), authorization: str | None = Header(None)):
    user = _get_user_from_header(authorization)
    _require_active_membership(user["id"], company_id)

    try:
        # 1. Inventory stats
        inv_result = await get_inventory(company_id)
        items = inv_result.get("items", [])
        total_products = len(items)
        low_stock_alerts = inv_result.get("low_stock_alerts", [])
        total_value = round(
            sum(
                (item.get("quantity", 0) or 0) * (item.get("unit_price") or 0)
                for item in items
            )
        )

        # 2. Invoices
        inv_data = (
            supabase.table("invoices")
            .select("*")
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .execute()
        )
        all_invoices = inv_data.data or []

        now = datetime.now(timezone.utc)
        invoices_this_month = sum(
            1 for iv in all_invoices
            if _is_this_month(iv.get("created_at") or iv.get("invoice_date"), now)
        )

        recent_invoices = all_invoices[:5]

        # 3. Invoice volume (last 30 days)
        thirty_days_ago = now - timedelta(days=30)
        recent_for_chart = [
            iv for iv in all_invoices
            if iv.get("created_at")
            and datetime.fromisoformat(iv["created_at"].replace("Z", "+00:00")) >= thirty_days_ago
        ]

        volume_by_date: dict[str, int] = {}
        for iv in recent_for_chart:
            d = (iv.get("created_at") or "")[:10]  # YYYY-MM-DD
            if d:
                volume_by_date[d] = volume_by_date.get(d, 0) + 1

        invoice_volume_30d = [
            {"date": d, "invoices": count}
            for d, count in sorted(volume_by_date.items())
        ]

        # 4. Top products by stock value
        top_products = sorted(
            [
                {
                    "name": item.get("product_name", ""),
                    "value": (item.get("quantity", 0) or 0) * (item.get("unit_price") or 0),
                }
                for item in items
            ],
            key=lambda x: x["value"],
            reverse=True,
        )[:5]

        # 5. Risk distribution
        risk_counts = {"NONE": 0, "LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        for iv in all_invoices:
            risk = iv.get("risk_level", "NONE")
            if risk in risk_counts:
                risk_counts[risk] += 1

        risk_distribution = [
            {"name": k, "value": v, "color": _risk_color(k)}
            for k, v in risk_counts.items()
        ]

        return {
            "success": True,
            "summary": {
                "total_products": total_products,
                "low_stock_count": len(low_stock_alerts),
                "invoices_this_month": invoices_this_month,
                "total_inventory_value": total_value,
                "recent_invoices": recent_invoices,
                "low_stock_alerts": low_stock_alerts,
                "invoice_volume_30d": invoice_volume_30d,
                "top_products_by_value": top_products,
                "risk_distribution": risk_distribution,
            },
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
