"""
Aggregates all v1 routers — mirrors Node.js routes/index.ts mounting order.

Node.js mounting:
  router.use('/auth', authRoutes)
  router.use('/users', userRoutes)
  router.use('/tenants', tenantRoutes)
  router.use('/documents', documentRoutes)
  router.use('/chat', chatRoutes)
  router.use('/analytics', analyticsRoutes)
  router.use('/admin', adminRoutes)
  router.use('/plans', planRoutes)
  router.use('/subscriptions', subscriptionRoutes)
  router.use('/payments', paymentsRoutes)
  router.use('/public/chat', publicChatRoutes)
  router.use('/orders', orderRoutes)
  router.use('/invoices', invoiceRoutes)
  router.use('/stripe', stripeRoutes)
"""

from fastapi import APIRouter

from app.api.v1.admin import router as admin_router
from app.api.v1.assets import router as assets_router
from app.api.v1.analytics import router as analytics_router
from app.api.v1.auth import router as auth_router
from app.api.v1.chat import router as chat_router
from app.api.v1.documents import router as documents_router
from app.api.v1.invoices import router as invoices_router
from app.api.v1.orders import router as orders_router
from app.api.v1.payments import router as payments_router
from app.api.v1.plans import router as plans_router
from app.api.v1.public_chat import router as public_chat_router
from app.api.v1.stripe import router as stripe_router
from app.api.v1.subscriptions import router as subscriptions_router
from app.api.v1.tenants import router as tenants_router
from app.api.v1.users import router as users_router

api_router = APIRouter(prefix="/api/v1")

# Mount in same order as Node.js
api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(tenants_router)
api_router.include_router(assets_router)
api_router.include_router(documents_router)
api_router.include_router(chat_router)
api_router.include_router(analytics_router)
api_router.include_router(admin_router)
api_router.include_router(plans_router)
api_router.include_router(subscriptions_router)
api_router.include_router(payments_router)
api_router.include_router(public_chat_router)
api_router.include_router(orders_router)
api_router.include_router(invoices_router)
api_router.include_router(stripe_router)
