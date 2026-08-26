import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from core.supabase_client import supabase

router = APIRouter(prefix="/api/parties", tags=["Parties"])


class PartyCreate(BaseModel):
    name: str = Field(min_length=1)
    party_type: str = Field(default="Sundry Debtor")
    address: str | None = None
    city: str | None = None
    pincode: str | None = None
    state: str | None = None
    country: str | None = "India"
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    gst_no: str | None = None
    dl_no: str | None = None
    food_licence_no: str | None = None
    bank_acc: str | None = None


@router.get("/")
async def get_parties():
    try:
        response = (
            supabase.table("parties")
            .select("*")
            .order("name")
            .execute()
        )
        return {"success": True, "parties": response.data or []}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/")
async def create_party(party: PartyCreate):
    try:
        party_id = str(uuid.uuid4())
        data = party.model_dump()
        data["id"] = party_id
        data["created_at"] = datetime.utcnow().isoformat()

        supabase.table("parties").insert(data).execute()

        created = supabase.table("parties").select("*").eq("id", party_id).limit(1).execute()
        return {"success": True, "party": created.data[0] if created.data else data}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))