from fastapi import APIRouter, HTTPException
from services.inventory_service import get_inventory

router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


@router.get("/")
async def fetch_inventory():
    """Get all inventory with low stock alerts"""
    result = await get_inventory()
    if not result["success"]:
        raise HTTPException(status_code=500, detail=result["error"])
    return result
