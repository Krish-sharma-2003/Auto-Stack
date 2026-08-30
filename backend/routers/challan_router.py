from datetime import date

from fastapi import APIRouter, HTTPException, Query, Header
from pydantic import BaseModel, Field

from core.supabase_client import supabase
from core.auth import _get_user_from_header, _require_active_membership


router = APIRouter(prefix="/api/challans", tags=["Challans"])


class ChallanItem(BaseModel):
    product: str = Field(min_length=1)
    qty: float = Field(gt=0)
    unit: str = Field(min_length=1)


class ChallanCreate(BaseModel):
    challan_no: str = Field(min_length=1)
    party_name: str = Field(min_length=1)
    challan_date: date
    delivery_address: str = Field(min_length=1)
    transport_name: str | None = None
    vehicle_no: str | None = None
    items: list[ChallanItem] = Field(min_length=1)


@router.post("")
async def create_challan(company_id: str = Query(...), authorization: str | None = Header(None), challan: ChallanCreate = ...):
    user = _get_user_from_header(authorization)
    _require_active_membership(user["id"], company_id)
    try:
        response = supabase.table("challans").insert({
            "company_id": company_id,
            "challan_no": challan.challan_no,
            "party_name": challan.party_name,
            "challan_date": challan.challan_date.isoformat(),
            "delivery_address": challan.delivery_address,
            "transport_name": challan.transport_name or None,
            "vehicle_no": challan.vehicle_no or None,
            "items": [item.model_dump() for item in challan.items],
        }).execute()
        saved_challan = response.data[0] if response.data else None
        return {
            "success": True,
            "message": "Challan saved successfully",
            "challan": saved_challan,
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not save challan: {str(exc)}")
