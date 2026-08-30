from datetime import datetime
import uuid

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel, Field, EmailStr

from core.supabase_client import supabase

router = APIRouter(prefix="/api/companies", tags=["Users"])


# ── Helpers ──────────────────────────────────────────────────────────────

def _get_user_from_header(authorization: str | None) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ", 1)[1]
    try:
        user_resp = supabase.auth.get_user(jwt=token)
        user = user_resp.user if hasattr(user_resp, "user") else user_resp.get("user")
        if not user:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user.id, "email": (user.email or "").lower().strip()}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Auth failed: {str(exc)}")


def _require_admin(user_id: str, company_id: str):
    membership = supabase.table("company_users") \
        .select("role") \
        .eq("user_id", user_id) \
        .eq("company_id", company_id) \
        .eq("status", "Active") \
        .limit(1) \
        .execute()
    if not membership.data:
        raise HTTPException(status_code=403, detail="Admin access required")
    if membership.data[0].get("role") != "Admin":
        raise HTTPException(status_code=403, detail="Admin access required")


# ── Schemas ──────────────────────────────────────────────────────────────

class InviteUser(BaseModel):
    email: EmailStr
    role: str = Field(default="Accountant", pattern="^(Admin|Manager|Accountant)$")


class UpdateUser(BaseModel):
    role: str | None = Field(default=None, pattern="^(Admin|Manager|Accountant)$")
    status: str | None = Field(default=None, pattern="^(Active|Invited|Inactive)$")
    email: EmailStr | None = None


class AcceptInviteResponse(BaseModel):
    success: bool
    company_id: str | None = None
    message: str


# ── Endpoints ────────────────────────────────────────────────────────────

@router.get("/{company_id}/users")
async def list_company_users(
    company_id: str,
    authorization: str | None = Header(None),
):
    user = _get_user_from_header(authorization)
    _require_admin(user["id"], company_id)

    try:
        response = (
            supabase.table("company_users")
            .select("id, user_id, email, role, status, created_at")
            .eq("company_id", company_id)
            .order("created_at", desc=True)
            .execute()
        )
        return {"success": True, "users": response.data or []}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/{company_id}/users/invite")
async def invite_user(
    company_id: str,
    payload: InviteUser,
    authorization: str | None = Header(None),
):
    user = _get_user_from_header(authorization)
    _require_admin(user["id"], company_id)

    email = payload.email.lower().strip()
    role = payload.role

    try:
        existing = supabase.table("company_users") \
            .select("id, status") \
            .eq("company_id", company_id) \
            .eq("email", email) \
            .limit(1) \
            .execute()

        if existing.data:
            row = existing.data[0]
            if row.get("status") == "Active":
                raise HTTPException(status_code=409, detail="User already active in this company")
            # If invited, re-send invite (update role if changed)
            supabase.table("company_users").update({
                "role": role,
                "status": "Invited",
                "user_id": None,
                "created_at": datetime.utcnow().isoformat(),
            }).eq("id", row["id"]).execute()
            return {"success": True, "message": "Invite updated and resent"}

        supabase.table("company_users").insert({
            "id": str(uuid.uuid4()),
            "company_id": company_id,
            "user_id": None,
            "email": email,
            "role": role,
            "status": "Invited",
            "created_at": datetime.utcnow().isoformat(),
        }).execute()

        return {"success": True, "message": "Invitation sent"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not invite user: {str(exc)}")


@router.patch("/{company_id}/users/{user_row_id}")
async def update_user(
    company_id: str,
    user_row_id: str,
    payload: UpdateUser,
    authorization: str | None = Header(None),
):
    user = _get_user_from_header(authorization)
    _require_admin(user["id"], company_id)

    try:
        updates: dict = {}

        if payload.role:
            updates["role"] = payload.role

        if payload.status:
            updates["status"] = payload.status

        if payload.email:
            new_email = payload.email.lower().strip()
            updates["email"] = new_email
            # If this user was Active, changing email hands over the seat
            current = supabase.table("company_users") \
                .select("user_id, status") \
                .eq("id", user_row_id) \
                .limit(1) \
                .execute()
            if current.data and current.data[0].get("status") == "Active":
                updates["user_id"] = None
                updates["status"] = "Invited"

        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")

        supabase.table("company_users").update(updates).eq("id", user_row_id).eq("company_id", company_id).execute()
        return {"success": True, "message": "User updated"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not update user: {str(exc)}")


@router.delete("/{company_id}/users/{user_row_id}")
async def remove_user(
    company_id: str,
    user_row_id: str,
    authorization: str | None = Header(None),
):
    user = _get_user_from_header(authorization)
    _require_admin(user["id"], company_id)

    try:
        supabase.table("company_users").delete().eq("id", user_row_id).eq("company_id", company_id).execute()
        return {"success": True, "message": "User removed from company"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not remove user: {str(exc)}")


@router.post("/accept-invite")
async def accept_invite(authorization: str | None = Header(None)):
    requester = _get_user_from_header(authorization)
    user_id = requester["id"]
    email = requester["email"]

    try:
        # Find pending invite for this email
        invite = supabase.table("company_users") \
            .select("id, company_id, status") \
            .eq("email", email) \
            .eq("status", "Invited") \
            .limit(1) \
            .execute()

        if not invite.data:
            return {"success": False, "message": "No pending invite found"}

        row = invite.data[0]
        supabase.table("company_users").update({
            "user_id": user_id,
            "status": "Active",
        }).eq("id", row["id"]).execute()

        return {"success": True, "company_id": row["company_id"], "message": "Invite accepted"}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Could not accept invite: {str(exc)}")
