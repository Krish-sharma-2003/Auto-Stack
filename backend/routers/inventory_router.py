from fastapi import APIRouter, HTTPException, Query, Header
from services.inventory_service import get_inventory
from core.auth import _get_user_from_header, _require_active_membership

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/")
async def fetch_inventory(company_id: str = Query(...), authorization: str | None = Header(None)):
    user = _get_user_from_header(authorization)
    _require_active_membership(user["id"], company_id)
    result = await get_inventory(company_id)
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
