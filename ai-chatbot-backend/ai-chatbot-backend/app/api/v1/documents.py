import hashlib
import os
import uuid
from pathlib import Path
 
from fastapi import APIRouter, Depends, Query, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.document_service import DocumentProcessingService
 
from app.api.deps import CurrentUser, get_current_user, require_admin
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import BadRequestError, NotFoundError, AppException
from app.core.logging import logger
from app.repositories.category_repo import CategoryRepository
from app.repositories.analytics_repo import AnalyticsRepository
from app.repositories.document_repo import ChunkRepository, DocumentRepository
from app.schemas.document import (
    CategoryCreateRequest,
    CategoryUpdateRequest,
    DocumentUpdateRequest,
    SearchRequest,
)
 
from app.repositories.tenant_repo import TenantRepository
 
 
router = APIRouter(prefix="/documents", tags=["Documents"])
 
 
@router.post("/upload")
async def upload_document(
    file: list[UploadFile] = File(...),
    category_id: int | None = Form(None, alias="categoryId"),
    is_public: bool = Form(False, alias="isPublic"),
    tags: str | None = Form(None),
    description: str | None = Form(None),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    results = []
    repo = DocumentRepository(db)
    from app.services.document_service import DocumentProcessingService
    processing_service = DocumentProcessingService()
 
    for f in file:
        try:
            # Validate file type
            ext = os.path.splitext(f.filename or "")[1].lower()
            if ext not in settings.allowed_file_types_list:
                if len(file) == 1:
                    raise BadRequestError(f"File type {ext} not allowed")
                results.append({
                    "filename": f.filename,
                    "status": "failed",
                    "message": f"File type {ext} not allowed"
                })
                continue
 
            # Read file content
            content = await f.read()
            if len(content) > settings.MAX_FILE_SIZE:
                if len(file) == 1:
                    raise BadRequestError(f"File too large (max {settings.MAX_FILE_SIZE / (1024*1024):.0f}MB)")
                results.append({
                    "filename": f.filename,
                    "status": "failed",
                    "message": f"File too large (max {settings.MAX_FILE_SIZE / (1024*1024):.0f}MB)"
                })
                continue
 
            # Generate file hash for dedup
            file_hash = hashlib.sha256(content).hexdigest()
 
            existing = await repo.get_by_hash(file_hash, current_user.tenant_id)
            if existing:
                if len(file) == 1:
                    raise BadRequestError(
                        message="A file with identical content already exists",
                        code="DUPLICATE_FILE"
                    )
                results.append({
                    "filename": f.filename,
                    "status": "failed",
                    "message": "Duplicate file content",
                    "documentId": existing.id
                })
                continue
 
            # Save file to disk
            stored_filename = f"doc_{uuid.uuid4().hex[:6]}_{f.filename}"
            upload_dir = Path(settings.UPLOAD_DIR) / "documents" / f"tenant_{current_user.tenant_id}"
            upload_dir.mkdir(parents=True, exist_ok=True)
            file_path = upload_dir / stored_filename
 
            with open(file_path, "wb") as w:
                w.write(content)
 
            # Create document record
            doc = await repo.create({
                "tenant_id": current_user.tenant_id,
                "category_id": category_id,
                "uploaded_by": current_user.id,
                "original_filename": f.filename or "unknown",
                "stored_filename": stored_filename,
                "file_path": str(file_path),
                "file_size": len(content),
                "mime_type": f.content_type,
                "file_hash": file_hash,
                "title": f.filename,
                "description": description,
                "tags": tags,
                "is_public": is_public,
                "status": "uploading",
                "processing_status": "pending",
            })
 
            # Trigger background processing
            import asyncio
            asyncio.create_task(
                processing_service.process_document(doc.id, current_user.tenant_id, str(file_path))
            )
 
            # Increment analytics: documents_uploaded
            analytics_repo = AnalyticsRepository(db)
            await analytics_repo.increment_tenant_metric(current_user.tenant_id, "documents_uploaded")
 
            results.append({
                "documentId": doc.id,
                "filename": doc.original_filename,
                "status": "uploaded",
                "message": "Upload successful, processing started",
            })
 
        except AppException:
            # Re-raise AppExceptions (like our BadRequestError) to be caught by global handler
            raise
        except Exception as e:
            logger.error(f"Error uploading file {f.filename}: {e}")
            if len(file) == 1:
                raise # Let it bubble up to unhandled_exception_handler
            results.append({
                "filename": f.filename,
                "status": "failed",
                "message": str(e)
            })
 
    return {
        "success": True,
        "data": {
            "results": results,
        },
        "message": f"Processed {len(results)} files"
    }
 
@router.post("/search")
async def search_documents(
    body: SearchRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.openai_service import OpenAIService
    from app.services.weaviate_service import SearchOptions, WeaviateService
    import asyncio
 
    openai_svc = OpenAIService()
    weaviate_svc = WeaviateService.get_instance()
 
    # Generate embedding for the query
    emb_result = await openai_svc.generate_embedding(body.query, current_user.tenant_id)
 
    # Search Weaviate
    search_results = await asyncio.to_thread(
        weaviate_svc.search_similar_chunks,
        emb_result.embedding,
        SearchOptions(
            tenant_id=current_user.tenant_id,
            limit=body.limit or 10,
            threshold=body.threshold,
            categories=[],
            document_ids=body.document_ids or [],
        ),
    )
 
    return {
        "success": True,
        "data": [
            {
                "id": r.id,
                "content": r.content,
                "score": r.score,
                "chunkId": r.chunk_id,
                "documentId": r.document_id,
                "documentTitle": r.document_title,
                "documentFilename": r.document_filename,
                "categoryName": r.category_name,
                "tokenCount": r.token_count,
            }
            for r in search_results
        ],
        "message": "Search completed",
    }
 
 
@router.get("/categories")
async def list_categories(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    tenant_id: int | None = Query(None, alias="tenantId"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import text
 
    params: dict = {}
    where_clause = ""
    if current_user.role != "super_admin":
        where_clause = "WHERE dc.tenant_id = :tid "
        params["tid"] = current_user.tenant_id
    elif tenant_id:
        where_clause = "WHERE dc.tenant_id = :tid "
        params["tid"] = tenant_id
 
    # Count total
    count_query = text(f"SELECT COUNT(*) FROM document_categories dc {where_clause}")
    total_result = await db.execute(count_query, params)
    total = total_result.scalar() or 0
 
    # Data query
    offset = (page - 1) * limit
    params["limit"] = limit
    params["offset"] = offset
 
    query = text(f"""
        SELECT dc.*, COUNT(d.id) AS document_count
        FROM document_categories dc
        LEFT JOIN documents d ON d.category_id = dc.id
        {where_clause}
        GROUP BY dc.id
        ORDER BY dc.sort_order, dc.name
        LIMIT :limit OFFSET :offset
    """)
    result = await db.execute(query, params)
    rows = result.mappings().all()
 
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)
 
    categories = [
        {
            "id": r["id"],
            "tenant_id": r["tenant_id"],
            "name": r["name"],
            "description": r.get("description"),
            "parent_id": r.get("parent_id"),
            "sort_order": r.get("sort_order", 0),
            "status": r.get("status", "active"),
            "document_count": r.get("document_count", 0),
            "created_at": fmt_ts(r.get("created_at")),
            "updated_at": fmt_ts(r.get("updated_at")),
        }
        for r in rows
    ]
 
    return {
        "success": True,
        "data": {
            "categories": categories,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": -(-total // limit)
            }
        }
    }
 
 
@router.post("/categories")
async def create_category(
    body: CategoryCreateRequest,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = CategoryRepository(db)
    tenant_repo = TenantRepository(db)
 
    # Determine tenant_id based on role
    if current_user.role == "super_admin":
        if not body.tenant_slug:
            raise BadRequestError("tenantSlug is required for super admin")
 
        tenant = await tenant_repo.get_by_slug(body.tenant_slug)
        if not tenant:
            raise NotFoundError("Tenant not found")
 
        tenant_id = tenant.id
 
    else:
        # tenant_admin always creates for their own tenant
        tenant_id = current_user.tenant_id
 
    category = await repo.create({
        "tenant_id": tenant_id,
        "name": body.name,
        "description": body.description,
        "parent_id": body.parent_id,
        "sort_order": body.sort_order,
    })
 
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)
 
    return {
        "success": True,
        "data": {
            "category": {
                "id": category.id,
                "tenant_id": tenant_id,
                "name": category.name,
                "description": category.description,
                "parent_id": category.parent_id,
                "sort_order": category.sort_order,
                "status": getattr(category, "status", "active"),
                "created_at": fmt_ts(category.created_at) if hasattr(category, "created_at") else None,
                "updated_at": fmt_ts(category.updated_at) if hasattr(category, "updated_at") else None,
            }
        },
        "message": "Category created",
    }
 
@router.delete("/categories/{category_id}")
async def delete_category(
    category_id: int,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = CategoryRepository(db)
 
    cat = await repo.get_by_id(category_id)
 
    if not cat:
        raise NotFoundError("Category not found")
 
    # Super admin can delete any tenant category
    if current_user.role != "super_admin":
        if cat.tenant_id != current_user.tenant_id:
            raise NotFoundError("Category not found")
 
    await repo.delete_by_id(category_id)
 
    return {
        "success": True,
        "message": "Category deleted"
    }
 
 
@router.put("/categories/{category_id}")
async def update_category(
    category_id: int,
    body: CategoryUpdateRequest,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    repo = CategoryRepository(db)
    tenant_repo = TenantRepository(db)
 
    cat = await repo.get_by_id(category_id)
 
    if not cat:
        raise NotFoundError("Category not found")
 
    # Determine tenant_id
    if current_user.role == "super_admin":
        if not body.tenant_slug:
            raise BadRequestError("tenantSlug is required")
 
        tenant = await tenant_repo.get_by_slug(body.tenant_slug)
 
        if not tenant:
            raise NotFoundError("Tenant not found")
 
        tenant_id = tenant.id
    else:
        tenant_id = current_user.tenant_id
 
    # Check tenant ownership
    if cat.tenant_id != tenant_id:
        raise NotFoundError("Category not found")
 
    update_data = body.model_dump(exclude_none=True)
    # Remove tenant_slug because it's not a DB column
    update_data.pop("tenant_slug", None)
 
    await repo.update_by_id(category_id, update_data)
 
    updated_cat = await repo.get_by_id(category_id)
 
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)
 
    return {
        "success": True,
        "data": {
            "category": {
                "id": updated_cat.id,
                "tenant_id": updated_cat.tenant_id,
                "name": updated_cat.name,
                "description": updated_cat.description,
                "parent_id": updated_cat.parent_id,
                "sort_order": updated_cat.sort_order,
                "status": getattr(updated_cat, "status", "active"),
                "created_at": fmt_ts(updated_cat.created_at),
                "updated_at": fmt_ts(updated_cat.updated_at),
            }
        },
        "message": "Category updated",
    }
 
 
@router.get("")
async def list_documents(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status: str | None = None,
    category_id: int | None = Query(None, alias="categoryId"),
    tenant_id: int | None = Query(None, alias="tenantId"),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from sqlalchemy import text
 
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)
 
    # Base condition
    where = "WHERE 1=1"
    params: dict = {}
 
    # Apply tenant filter
    if current_user.role != "super_admin":
        where += " AND d.tenant_id = :tenant_id"
        params["tenant_id"] = current_user.tenant_id
    elif tenant_id:
        # Super admin can filter by a specific tenant
        where += " AND d.tenant_id = :tenant_id"
        params["tenant_id"] = tenant_id
 
    # Optional filters
    if status:
        where += " AND d.status = :status"
        params["status"] = status
 
    if category_id:
        where += " AND d.category_id = :category_id"
        params["category_id"] = category_id
 
    # Count total documents
    count_query = f"""
        SELECT COUNT(*)
        FROM documents d
        {where}
    """
 
    r = await db.execute(text(count_query), params)
    total = r.scalar() or 0
 
    # Pagination
    offset = (page - 1) * limit
    params["lim"] = limit
    params["off"] = offset
 
    # Main query
    query = f"""
        SELECT d.*, dc.name AS category_name
        FROM documents d
        LEFT JOIN document_categories dc ON d.category_id = dc.id
        {where}
        ORDER BY d.created_at DESC
        LIMIT :lim OFFSET :off
    """
 
    result = await db.execute(text(query), params)
    rows = result.mappings().all()
 
    documents = [
        {
            "id": d["id"],
            "tenant_id": d["tenant_id"],
            "category_id": d.get("category_id"),
            "uploaded_by": d["uploaded_by"],
            "original_filename": d["original_filename"],
            "stored_filename": d["stored_filename"],
            "file_path": d["file_path"],
            "file_size": d["file_size"],
            "mime_type": d.get("mime_type"),
            "file_hash": d.get("file_hash"),
            "title": d.get("title"),
            "description": d.get("description"),
            "tags": d.get("tags"),
            "status": d.get("status"),
            "processing_status": d.get("processing_status"),
            "error_message": d.get("error_message"),
            "chunk_count": d.get("chunk_count", 0),
            "embedding_count": d.get("embedding_count", 0),
            "version": d.get("version", 1),
            "is_public": d.get("is_public", 0),
            "created_at": fmt_ts(d.get("created_at")),
            "updated_at": fmt_ts(d.get("updated_at")),
            "category_name": d.get("category_name"),
        }
        for d in rows
    ]
 
    return {
        "success": True,
        "data": {
            "documents": documents,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total,
                "pages": -(-total // limit),
            },
        },
    }
 
 
@router.post("/{document_id}/reprocess")
async def reprocess_document(
    document_id: int,
    current_user: CurrentUser = Depends(require_admin()),
    db: AsyncSession = Depends(get_db),
):
    import asyncio
    from app.services.document_service import DocumentProcessingService
 
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise NotFoundError("Document not found")
   
    # Allow super_admin to reprocess any tenant's document
    if current_user.role != "super_admin" and doc.tenant_id != current_user.tenant_id:
        raise NotFoundError("Document not found")
 
    processing_service = DocumentProcessingService()
    asyncio.create_task(
        processing_service.reprocess_document(document_id, current_user.tenant_id)
    )
    return {"success": True, "data": {"message": "Document reprocessing started"}}
 
 
@router.get("/{document_id}/chunks")
async def get_document_chunks(
    document_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise NotFoundError("Document not found")
   
    # Allow super_admin to get chunks for any tenant's document
    if current_user.role != "super_admin" and doc.tenant_id != current_user.tenant_id:
        raise NotFoundError("Document not found")
    chunk_repo = ChunkRepository(db)
    chunks = await chunk_repo.get_by_document(document_id)
    return {
        "success": True,
        "data": [
            {
                "id": c.id, "chunkIndex": c.chunk_index, "content": c.content,
                "tokenCount": c.token_count, "embeddingStatus": c.embedding_status,
                "metadata": c.chunk_metadata,
                "createdAt": c.created_at.isoformat() if c.created_at else None,
            }
            for c in chunks
        ],
    }
 
 
@router.get("/{document_id}")
async def get_document(
    document_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise NotFoundError("Document not found")
   
    # Allow super_admin to get any tenant's document
    if current_user.role != "super_admin" and doc.tenant_id != current_user.tenant_id:
        raise NotFoundError("Document not found")
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)
 
    return {
        "success": True,
        "data": {
            "document": {
                "id": doc.id,
                "title": doc.title,
                "tags": doc.tags,
                "description": doc.description,
                "original_filename": doc.original_filename,
                "file_path": doc.file_path,
                "file_size": doc.file_size,
                "mime_type": doc.mime_type,
                "storage_path": doc.file_path,
                "processing_status": doc.processing_status,
                "chunk_count": doc.chunk_count,
                "embedding_count": doc.embedding_count,
                "is_public": doc.is_public,
                "category_id": doc.category_id,
                "version": doc.version,
                "created_at": fmt_ts(doc.created_at),
                "updated_at": fmt_ts(doc.updated_at),
            }
        },
    }
 
 
@router.put("/{document_id}")
async def update_document(
    document_id: int,
    body: DocumentUpdateRequest,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise NotFoundError("Document not found")
   
    # Allow super_admin to update any tenant's document
    if current_user.role != "super_admin" and doc.tenant_id != current_user.tenant_id:
        raise NotFoundError("Document not found")
    update_data = body.model_dump(exclude_none=True,exclude={"tenant_slug"})
    await repo.update_by_id(document_id, update_data)
 
    # Refetch updated document
    updated_doc = await repo.get_by_id(document_id)
 
    def fmt_ts(val):
        if val is None:
            return None
        return val.isoformat() + ".000Z" if hasattr(val, "isoformat") else str(val)
 
    return {
        "success": True,
        "data": {
            "document": {
                "id": updated_doc.id,
                "title": updated_doc.title,
                "tags": updated_doc.tags,
                "description": updated_doc.description,
                "original_filename": updated_doc.original_filename,
                "file_path": updated_doc.file_path,
                "file_size": updated_doc.file_size,
                "mime_type": updated_doc.mime_type,
                "storage_path": updated_doc.file_path,
                "processing_status": updated_doc.processing_status,
                "chunk_count": updated_doc.chunk_count,
                "embedding_count": updated_doc.embedding_count,
                "is_public": updated_doc.is_public,
                "category_id": updated_doc.category_id,
                "version": updated_doc.version,
                "created_at": fmt_ts(updated_doc.created_at),
                "updated_at": fmt_ts(updated_doc.updated_at),
            }
        },
    }
 
 
@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise NotFoundError("Document not found")
   
    # Allow super_admin to delete any tenant's document
    if current_user.role != "super_admin" and doc.tenant_id != current_user.tenant_id:
        raise NotFoundError("Document not found")
 
    # Delete file from disk
    try:
        if os.path.exists(doc.file_path):
            os.remove(doc.file_path)
    except OSError:
        logger.warning(f"Could not delete file: {doc.file_path}")
 
    # Delete chunks from Weaviate
    import asyncio
    from app.services.weaviate_service import WeaviateService
 
    try:
        weaviate_svc = WeaviateService.get_instance()
        await asyncio.to_thread(
            weaviate_svc.delete_document_chunks, document_id, current_user.tenant_id
        )
    except Exception as e:
        logger.warning(f"Failed to delete Weaviate chunks for doc {document_id}: {e}")
 
    # Delete from DB (cascades to chunks)
    await repo.delete_by_id(document_id)
    return {"success": True, "message": "Document deleted"}
@router.get("/{document_id}/view")
async def view_document(
    document_id: int,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    repo = DocumentRepository(db)
    doc = await repo.get_by_id(document_id)
    if not doc:
        raise NotFoundError("Document not found")
   
    # Allow super_admin to view any tenant's document
    if current_user.role != "super_admin" and doc.tenant_id != current_user.tenant_id:
        raise NotFoundError("Document not found")
 
    if not os.path.exists(doc.file_path):
        raise NotFoundError("File not found on server")
 
    return FileResponse(
        path=doc.file_path,
        filename=doc.original_filename,
        media_type=doc.mime_type
    )
 