from fastapi import HTTPException
from core.supabase_client import supabase


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


def _require_active_membership(user_id: str, company_id: str):
    membership = supabase.table("company_users") \
        .select("status") \
        .eq("user_id", user_id) \
        .eq("company_id", company_id) \
        .eq("status", "Active") \
        .limit(1) \
        .execute()
    if not membership.data:
        raise HTTPException(status_code=403, detail="Not an active member of this company")
