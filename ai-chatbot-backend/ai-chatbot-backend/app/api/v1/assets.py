import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, UploadFile, File, Request
from app.api.deps import CurrentUser, get_current_user
from app.core.config import settings
from app.core.exceptions import BadRequestError
from app.core.logging import logger

router = APIRouter(prefix="/assets", tags=["Assets"])

ALLOWED_IMAGE_TYPES = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"]
ASSET_MAX_SIZE = 2 * 1024 * 1024  # 2MB


@router.post("/upload")
async def upload_asset(
    request: Request,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
):
    """Upload a public asset (e.g. avatar, logo)."""

    # 1. Validate file type (images only)
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_IMAGE_TYPES:
        raise BadRequestError(f"File type {ext} not allowed. Only images are permitted.")

    # 2. Read content and validate size
    content = await file.read()
    if len(content) > ASSET_MAX_SIZE:
        raise BadRequestError("File too large. Max size is 2MB.")

    # 3. Prepare directory on the persistent Railway volume
    #    settings.UPLOAD_DIR resolves to /app/uploads (the mounted volume)
    relative_dir = Path("assets") / f"tenant_{current_user.tenant_id}"
    upload_dir = Path(settings.UPLOAD_DIR) / relative_dir

    try:
        upload_dir.mkdir(parents=True, exist_ok=True)
    except PermissionError as e:
        logger.error(
            f"Asset upload directory {upload_dir} is not writable. "
            f"Ensure Railway volume is mounted at {settings.UPLOAD_DIR}. Error: {e}"
        )
        raise BadRequestError(
            "Upload directory is not writable. Check Railway volume mount at /app/uploads."
        )
    except Exception as e:
        logger.error(f"Failed to create asset upload directory {upload_dir}: {e}")
        raise BadRequestError("Could not prepare upload directory.")

    # 4. Save file with unique name
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = upload_dir / unique_filename

    try:
        with open(file_path, "wb") as f:
            f.write(content)
    except PermissionError as e:
        logger.error(f"Permission denied writing asset file {file_path}: {e}")
        raise BadRequestError(
            "Upload directory is not writable. Check Railway volume mount at /app/uploads."
        )
    except Exception as e:
        logger.error(f"Failed to save asset file {file_path}: {e}")
        raise BadRequestError("Could not save uploaded file.")

    # 5. Build the public URL using the /uploads static mount
    #    StaticFiles is mounted at /uploads → settings.UPLOAD_DIR
    #    so the URL path is /uploads/<relative_dir>/<filename>
    public_url = f"/uploads/{relative_dir.as_posix()}/{unique_filename}"

    # If you need a fully absolute URL (e.g. to store in DB for emails/CDN):
    base_url = str(request.base_url).rstrip("/")
    absolute_url = f"{base_url}{public_url}"

    logger.info(
        f"Asset uploaded: tenant={current_user.tenant_id} "
        f"file={unique_filename} path={file_path}"
    )

    return {
        "success": True,
        "data": {
            "url": absolute_url,
            "path": public_url,
        },
        "message": "Asset uploaded successfully",
    }