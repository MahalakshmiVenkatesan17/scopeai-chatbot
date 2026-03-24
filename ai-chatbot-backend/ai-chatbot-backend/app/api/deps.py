"""Re-export dependencies for convenient imports in route files."""

from app.core.dependencies import (
    CurrentUser,
    get_current_user,
    get_optional_user,
    require_admin,
    require_role,
    require_super_admin,
)

__all__ = [
    "CurrentUser",
    "get_current_user",
    "get_optional_user",
    "require_admin",
    "require_role",
    "require_super_admin",
]
