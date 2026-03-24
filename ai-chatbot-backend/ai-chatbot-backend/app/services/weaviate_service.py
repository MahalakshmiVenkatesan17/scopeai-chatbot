import json
import time
from dataclasses import dataclass, field
from typing import Any

import weaviate
from weaviate.classes.config import Configure, DataType, Property
from weaviate.classes.query import Filter, MetadataQuery

from app.core.config import settings
from app.core.logging import logger


@dataclass
class SearchResult:
    id: str
    content: str
    metadata: dict
    score: float
    chunk_id: int
    document_id: int
    document_title: str = ""
    document_filename: str = ""
    category_name: str = ""
    token_count: int = 0


@dataclass
class SearchOptions:
    tenant_id: int
    limit: int = 10
    threshold: float | None = None
    categories: list[str] = field(default_factory=list)
    document_ids: list[int] = field(default_factory=list)


COLLECTION_NAME = "DocumentChunk"


class WeaviateService:
    _instance: "WeaviateService | None" = None

    def __init__(self) -> None:
        self._client: weaviate.WeaviateClient | None = None
        self._schema_initialized = False

    @classmethod
    def get_instance(cls) -> "WeaviateService":
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    # ------------------------------------------------------------------
    # Connection lifecycle
    # ------------------------------------------------------------------
    def _get_client(self) -> weaviate.WeaviateClient:
        if self._client is None:
            url = settings.WEAVIATE_URL
            # Parse scheme/host from URL
            host = url.replace("http://", "").replace("https://", "").split(":")[0]
            port = 8080
            if ":" in url.split("//")[-1]:
                try:
                    port = int(url.split("//")[-1].split(":")[1].split("/")[0])
                except (ValueError, IndexError):
                    pass
            grpc_port = 50051

            if settings.WEAVIATE_API_KEY:
                self._client = weaviate.connect_to_custom(
                    http_host=host,
                    http_port=port,
                    http_secure=url.startswith("https"),
                    grpc_host=host,
                    grpc_port=grpc_port,
                    grpc_secure=url.startswith("https"),
                    auth_credentials=weaviate.auth.AuthApiKey(settings.WEAVIATE_API_KEY),
                    skip_init_checks=True,
                )
            else:
                self._client = weaviate.connect_to_custom(
                    http_host=host,
                    http_port=port,
                    http_secure=url.startswith("https"),
                    grpc_host=host,
                    grpc_port=grpc_port,
                    grpc_secure=url.startswith("https"),
                    skip_init_checks=True,
                )

            logger.info(
                "Weaviate client initialized",
                url=settings.WEAVIATE_URL,
                has_api_key=bool(settings.WEAVIATE_API_KEY),
            )

        return self._client

    def close(self) -> None:
        if self._client:
            self._client.close()
            self._client = None
            logger.info("Weaviate client closed")

    # ------------------------------------------------------------------
    # Schema
    # ------------------------------------------------------------------
    def initialize_schema(self) -> None:
        if self._schema_initialized:
            return

        client = self._get_client()

        if client.collections.exists(COLLECTION_NAME):
            logger.info("Weaviate schema already exists")
            self._schema_initialized = True
            return

        client.collections.create(
            name=COLLECTION_NAME,
            description="Document chunks with embeddings for semantic search",
            vectorizer_config=Configure.Vectorizer.none(),
            properties=[
                Property(name="content", data_type=DataType.TEXT, description="Text content of the chunk"),
                Property(name="tenantId", data_type=DataType.INT, description="Tenant ID"),
                Property(name="documentId", data_type=DataType.INT, description="Source document ID"),
                Property(name="chunkId", data_type=DataType.INT, description="Database chunk ID"),
                Property(name="chunkIndex", data_type=DataType.INT, description="Index within document"),
                Property(name="documentTitle", data_type=DataType.TEXT, description="Document title"),
                Property(name="documentFilename", data_type=DataType.TEXT, description="Original filename"),
                Property(name="categoryId", data_type=DataType.INT, description="Category ID"),
                Property(name="categoryName", data_type=DataType.TEXT, description="Category name"),
                Property(name="isPublic", data_type=DataType.BOOL, description="Public access flag"),
                Property(name="tokenCount", data_type=DataType.INT, description="Token count"),
                Property(name="createdAt", data_type=DataType.DATE, description="Creation timestamp"),
                Property(name="metadata", data_type=DataType.TEXT, description="JSON metadata string"),
            ],
        )

        logger.info("Weaviate schema created", class_name=COLLECTION_NAME)
        self._schema_initialized = True

    # ------------------------------------------------------------------
    # Store
    # ------------------------------------------------------------------
    def store_document_chunk(
        self,
        chunk_id: int,
        document_id: int,
        tenant_id: int,
        content: str,
        embedding: list[float],
        chunk_index: int = 0,
        document_title: str = "",
        document_filename: str = "",
        category_name: str = "",
        token_count: int = 0,
        metadata: dict | None = None,
    ) -> str:
        client = self._get_client()
        collection = client.collections.get(COLLECTION_NAME)

        from datetime import datetime, timezone

        properties = {
            "content": content,
            "tenantId": tenant_id,
            "documentId": document_id,
            "chunkId": chunk_id,
            "chunkIndex": chunk_index,
            "documentTitle": document_title,
            "documentFilename": document_filename,
            "categoryId": 0,
            "categoryName": category_name,
            "isPublic": False,
            "tokenCount": token_count,
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "metadata": json.dumps(metadata or {}),
        }

        result = collection.data.insert(
            properties=properties,
            vector=embedding,
        )

        weaviate_id = str(result)

        logger.debug(
            "Document chunk stored in Weaviate",
            weaviate_id=weaviate_id,
            chunk_id=chunk_id,
            document_id=document_id,
            tenant_id=tenant_id,
        )

        return weaviate_id

    # ------------------------------------------------------------------
    # Search
    # ------------------------------------------------------------------
    def search_similar_chunks(
        self, query_embedding: list[float], options: SearchOptions
    ) -> list[SearchResult]:
        client = self._get_client()
        collection = client.collections.get(COLLECTION_NAME)

        # Build filter
        filters = Filter.by_property("tenantId").equal(options.tenant_id)

        if options.categories:
            cat_filter = Filter.by_property("categoryName").contains_any(options.categories)
            filters = filters & cat_filter

        if options.document_ids:
            if len(options.document_ids) == 1:
                doc_filter = Filter.by_property("documentId").equal(options.document_ids[0])
            else:
                doc_filters = [
                    Filter.by_property("documentId").equal(did) for did in options.document_ids
                ]
                doc_filter = doc_filters[0]
                for f in doc_filters[1:]:
                    doc_filter = doc_filter | f
            filters = filters & doc_filter

        response = collection.query.near_vector(
            near_vector=query_embedding,
            limit=options.limit,
            filters=filters,
            return_metadata=MetadataQuery(certainty=True, distance=True),
        )

        results: list[SearchResult] = []
        for obj in response.objects:
            score = obj.metadata.certainty if obj.metadata.certainty is not None else 0.0

            if options.threshold and score < options.threshold:
                continue

            props = obj.properties
            meta_str = props.get("metadata", "{}")
            try:
                meta = json.loads(meta_str) if isinstance(meta_str, str) else meta_str
            except (json.JSONDecodeError, TypeError):
                meta = {}

            results.append(
                SearchResult(
                    id=str(obj.uuid),
                    content=props.get("content", ""),
                    metadata=meta,
                    score=score,
                    chunk_id=props.get("chunkId", 0),
                    document_id=props.get("documentId", 0),
                    document_title=props.get("documentTitle", ""),
                    document_filename=props.get("documentFilename", ""),
                    category_name=props.get("categoryName", ""),
                    token_count=props.get("tokenCount", 0),
                )
            )

        logger.info(
            "Semantic search completed",
            tenant_id=options.tenant_id,
            raw_results=len(response.objects),
            filtered_results=len(results),
            threshold=options.threshold,
        )

        return results

    # ------------------------------------------------------------------
    # Delete
    # ------------------------------------------------------------------
    def delete_document_chunks(self, document_id: int, tenant_id: int) -> int:
        client = self._get_client()
        collection = client.collections.get(COLLECTION_NAME)

        result = collection.data.delete_many(
            where=(
                Filter.by_property("tenantId").equal(tenant_id)
                & Filter.by_property("documentId").equal(document_id)
            )
        )

        deleted = result.successful if result else 0
        logger.info(
            "Document chunks deleted from Weaviate",
            document_id=document_id,
            tenant_id=tenant_id,
            deleted_count=deleted,
        )
        return deleted

    def delete_tenant_data(self, tenant_id: int) -> int:
        client = self._get_client()
        collection = client.collections.get(COLLECTION_NAME)

        result = collection.data.delete_many(
            where=Filter.by_property("tenantId").equal(tenant_id)
        )

        deleted = result.successful if result else 0
        logger.info("Tenant data deleted from Weaviate", tenant_id=tenant_id, deleted_count=deleted)
        return deleted

    # ------------------------------------------------------------------
    # Get by ID
    # ------------------------------------------------------------------
    def get_chunk_by_id(self, weaviate_id: str) -> SearchResult | None:
        client = self._get_client()
        collection = client.collections.get(COLLECTION_NAME)

        try:
            obj = collection.query.fetch_object_by_id(weaviate_id)
            if not obj:
                return None

            props = obj.properties
            meta_str = props.get("metadata", "{}")
            try:
                meta = json.loads(meta_str) if isinstance(meta_str, str) else meta_str
            except (json.JSONDecodeError, TypeError):
                meta = {}

            return SearchResult(
                id=weaviate_id,
                content=props.get("content", ""),
                metadata=meta,
                score=1.0,
                chunk_id=props.get("chunkId", 0),
                document_id=props.get("documentId", 0),
                document_title=props.get("documentTitle", ""),
                document_filename=props.get("documentFilename", ""),
                category_name=props.get("categoryName", ""),
                token_count=props.get("tokenCount", 0),
            )
        except Exception as e:
            logger.error("Failed to get chunk by ID from Weaviate", weaviate_id=weaviate_id, error=str(e))
            return None

    # ------------------------------------------------------------------
    # Stats
    # ------------------------------------------------------------------
    def get_stats(self, tenant_id: int | None = None) -> dict[str, Any]:
        client = self._get_client()
        collection = client.collections.get(COLLECTION_NAME)

        agg = collection.aggregate.over_all(total_count=True)
        total_objects = agg.total_count if agg else 0

        tenant_objects = None
        if tenant_id is not None:
            tenant_agg = collection.aggregate.over_all(
                total_count=True,
                filters=Filter.by_property("tenantId").equal(tenant_id),
            )
            tenant_objects = tenant_agg.total_count if tenant_agg else 0

        collections_list = client.collections.list_all()
        schema_classes = len(collections_list) if collections_list else 0

        return {
            "totalObjects": total_objects,
            "tenantObjects": tenant_objects,
            "schemaClasses": schema_classes,
        }

    # ------------------------------------------------------------------
    # Health
    # ------------------------------------------------------------------
    def health_check(self) -> dict[str, Any]:
        start = time.time()
        try:
            client = self._get_client()
            meta = client.get_meta()
            response_time = int((time.time() - start) * 1000)

            return {
                "status": "healthy",
                "details": {
                    "connected": True,
                    "responseTime": response_time,
                    "version": meta.get("version", "unknown") if isinstance(meta, dict) else "unknown",
                },
            }
        except Exception:
            response_time = int((time.time() - start) * 1000)
            return {
                "status": "unhealthy",
                "details": {
                    "connected": False,
                    "responseTime": response_time,
                },
            }
