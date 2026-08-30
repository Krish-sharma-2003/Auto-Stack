from datetime import datetime
import uuid

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field

from core.supabase_client import supabase
from core.auth import _get_user_from_header

router = APIRouter(prefix="/api/companies", tags=["Companies"])


class CompanyCreate(BaseModel):
    name: str = Field(min_length=1)
    business_type: str | None = None
    industry: str | None = None
    gstin: str | None = None
    pan: str | None = None
    address: str | None = None
    city: str | None = None
    state: str | None = None
    pincode: str | None = None
    country: str | None = "India"
    phone: str | None = None
    email: str | None = None
    website: str | None = None
    bank_name: str | None = None
    bank_account_no: str | None = None
    ifsc_code: str | None = None
    financial_year_start: str | None = None
    logo_url: str | None = None


@router.get("/my")
async def list_my_companies(authorization: str | None = Header(None)):
    user = _get_user_from_header(authorization)
    user_id = user["id"]
    try:
        response = (
            supabase.table("company_users")
            .select("company_id, role, status, companies(*)")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .execute()
        )

        companies = []
        for row in (response.data or []):
            comp = row.get("companies") or {}
            companies.append({
                "company_id": row.get("company_id"),
                "role": row.get("role"),
                "status": row.get("status"),
                "name": comp.get("name"),
                "business_type": comp.get("business_type"),
                "industry": comp.get("industry"),
                "gstin": comp.get("gstin"),
                "pan": comp.get("pan"),
                "address": comp.get("address"),
                "city": comp.get("city"),
                "state": comp.get("state"),
                "pincode": comp.get("pincode"),
                "country": comp.get("country"),
                "phone": comp.get("phone"),
                "email": comp.get("email"),
                "website": comp.get("website"),
                "bank_name": comp.get("bank_name"),
                "bank_account_no": comp.get("bank_account_no"),
                "ifsc_code": comp.get("ifsc_code"),
                "financial_year_start": comp.get("financial_year_start"),
                "logo_url": comp.get("logo_url"),
            })
        return {"success": True, "companies": companies}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("")
async def create_company(company: CompanyCreate, authorization: str | None = Header(None)):
    user = _get_user_from_header(authorization)
    user_id = user["id"]
    company_id = str(uuid.uuid4())

    try:
        data = company.model_dump(exclude_none=True)
        data["id"] = company_id
        data["owner_id"] = user_id
        data["created_at"] = datetime.utcnow().isoformat()

        supabase.table("companies").insert(data).execute()

        supabase.table("company_users").insert({
            "id": str(uuid.uuid4()),
            "company_id": company_id,
            "user_id": user_id,
            "role": "Admin",
            "status": "Active",
            "created_at": datetime.utcnow().isoformat(),
        }).execute()

        return {"success": True, "company_id": company_id, "message": "Company created successfully"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not create company: {str(exc)}")
