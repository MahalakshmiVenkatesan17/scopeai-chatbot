import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Request
from app.api.deps import CurrentUser, get_current_user
from app.core.config import settings
from app.core.exceptions import BadRequestError
from app.core.logging import logger

router = APIRouter(prefix="/assets", tags=["Assets"])

@router.post("/upload")
async def upload_asset(
    request: Request,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Upload a public asset (e.g. avatar, logo)."""
    # 1. Validate file type (images only)
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]:
        raise BadRequestError(f"File type {ext} not allowed. Only images are permitted.")

    # 2. Prepare directory
    relative_dir = Path("assets") / f"tenant_{current_user.tenant_id}"
    upload_dir = settings.upload_dir_path / relative_dir
    upload_dir.mkdir(parents=True, exist_ok=True)

    # 3. Save file with unique name
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = upload_dir / unique_filename

    try:
        content = await file.read()
        if len(content) > 2 * 1024 * 1024:  # 2MB limit for avatars
            raise BadRequestError("File too large. Max size is 2MB.")

        with open(file_path, "wb") as f:
            f.write(content)
            
    except Exception as e:
        logger.error(f"Failed to upload asset: {e}")
        if isinstance(e, BadRequestError):
            raise e
        raise BadRequestError("Could not save uploaded file.")

    # 4. Return the absolute public URL
    base_url = str(request.base_url).rstrip("/")
    # If working behind a proxy or in a subpath, you might need to adjust this
    public_url = f"{base_url}/uploads/{relative_dir.as_posix()}/{unique_filename}"
    
    return {
        "success": True,
        "data": {
            "url": public_url
        },
        "message": "Asset uploaded successfully"
    }
