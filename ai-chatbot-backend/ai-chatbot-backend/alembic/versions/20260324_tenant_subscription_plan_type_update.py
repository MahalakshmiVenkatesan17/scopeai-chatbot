"""tenant subscription_plan type update

Revision ID: 20260324_tenant_subscription_plan_type_update
Revises: 20260318_stripe_hardening
Create Date: 2026-03-24 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260324_tenant_subscription_plan_type_update'
down_revision = '20260318_stripe_hardening'
branch_labels = None
depends_on = None


def upgrade():
    # Convert tenant subscription_plan from strict enum to flexible varchar for dynamic plan names.
    # MySQL: change column type and keep existing values intact.
    op.execute(
        "ALTER TABLE tenants MODIFY COLUMN subscription_plan VARCHAR(50) NOT NULL DEFAULT 'free'"
    )
    # Normalize existing values to avoid case mismatch when frontend may provide capitalized names.
    op.execute(
        "UPDATE tenants SET subscription_plan = LOWER(subscription_plan) WHERE subscription_plan IS NOT NULL"
    )


def downgrade():
    # Revert to old limited enum values.
    op.execute(
        "ALTER TABLE tenants MODIFY COLUMN subscription_plan ENUM('free','basic','pro','enterprise') NOT NULL DEFAULT 'free'"
    )
