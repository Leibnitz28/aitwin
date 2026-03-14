from fastapi import APIRouter, HTTPException
from models.schemas import UserCreate, UserResponse
from utils.helpers import generate_id
from datetime import datetime
from typing import List

router = APIRouter()

# In-memory fallback store
users_db: dict = {}


def _vdb():
    """Get VectorDBService if available."""
    try:
        from services.vectordb_service import VectorDBService
        if VectorDBService.is_ready():
            return VectorDBService
    except Exception:
        pass
    return None


@router.post("/register", response_model=UserResponse, summary="Register a new user")
async def register_user(user: UserCreate):
    """Register a new user account."""
    vdb = _vdb()

    # Check for duplicate email — ChromaDB first, then memory
    if vdb:
        existing = vdb.get_user_by_email(user.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
    else:
        for existing in users_db.values():
            if existing["email"] == user.email:
                raise HTTPException(status_code=400, detail="Email already registered")

    user_id = generate_id()
    now = datetime.utcnow()

    # Persist to ChromaDB
    if vdb:
        vdb.upsert_user(user_id=user_id, name=user.name, email=user.email, created_at=now.isoformat())

    # Also keep in-memory
    users_db[user_id] = {
        "id": user_id,
        "name": user.name,
        "email": user.email,
        "created_at": now
    }

    return UserResponse(
        id=user_id,
        name=user.name,
        email=user.email,
        created_at=now
    )


@router.post("/login", summary="Login with email")
async def login_user(user: UserCreate):
    """Simple login — returns user data if found by email."""
    vdb = _vdb()

    # Check ChromaDB first
    if vdb:
        found = vdb.get_user_by_email(user.email)
        if found:
            return {"message": "Login successful", "user_id": found["id"], "name": found.get("name", "")}

    # Fallback to in-memory
    for u in users_db.values():
        if u["email"] == user.email:
            return {"message": "Login successful", "user_id": u["id"], "name": u["name"]}

    raise HTTPException(status_code=404, detail="User not found. Please register first.")


@router.get("/me/{user_id}", response_model=UserResponse, summary="Get user by ID")
async def get_user(user_id: str):
    """Retrieve a user profile by ID."""
    vdb = _vdb()

    # Check ChromaDB
    if vdb:
        data = vdb.get_user(user_id)
        if data:
            return UserResponse(
                id=data["id"],
                name=data.get("name", ""),
                email=data.get("email", ""),
                created_at=datetime.fromisoformat(data["created_at"]) if data.get("created_at") else datetime.utcnow(),
            )

    # Fallback
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    u = users_db[user_id]
    return UserResponse(**u)


@router.get("/", response_model=List[UserResponse], summary="List all users")
async def list_users():
    """Return all registered users."""
    vdb = _vdb()

    if vdb:
        data_list = vdb.list_users()
        if data_list:
            return [
                UserResponse(
                    id=d["id"],
                    name=d.get("name", ""),
                    email=d.get("email", ""),
                    created_at=datetime.fromisoformat(d["created_at"]) if d.get("created_at") else datetime.utcnow(),
                )
                for d in data_list
            ]

    return [UserResponse(**u) for u in users_db.values()]
