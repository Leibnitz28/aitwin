from fastapi import APIRouter, HTTPException
from models.schemas import UserCreate, UserResponse
from utils.helpers import generate_id
from datetime import datetime
from typing import List

router = APIRouter()

# In-memory user store (replace with DB later)
users_db: dict = {}


@router.post("/register", response_model=UserResponse, summary="Register a new user")
async def register_user(user: UserCreate):
    """Register a new user account."""
    # Check for duplicate email
    for existing in users_db.values():
        if existing["email"] == user.email:
            raise HTTPException(status_code=400, detail="Email already registered")

    user_id = generate_id()
    now = datetime.utcnow()

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
    for u in users_db.values():
        if u["email"] == user.email:
            return {"message": "Login successful", "user_id": u["id"], "name": u["name"]}

    raise HTTPException(status_code=404, detail="User not found. Please register first.")


@router.get("/me/{user_id}", response_model=UserResponse, summary="Get user by ID")
async def get_user(user_id: str):
    """Retrieve a user profile by ID."""
    if user_id not in users_db:
        raise HTTPException(status_code=404, detail="User not found")

    u = users_db[user_id]
    return UserResponse(**u)


@router.get("/", response_model=List[UserResponse], summary="List all users")
async def list_users():
    """Return all registered users."""
    return [UserResponse(**u) for u in users_db.values()]
