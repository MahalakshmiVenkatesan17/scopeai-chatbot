"""Add updated_at to invoices table.

Revision ID: 20260318_invoice_updated_at
Revises: 20260318_stripe
Create Date: 2026-03-18
"""

from alembic import op
import sqlalchemy as sa

revision = "20260318_invoice_updated_at"
down_revision = "20260318_stripe"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Adding updated_at column to invoices table
    op.add_column(
        "invoices",
        sa.Column(
            "updated_at",
            sa.DateTime(),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
            nullable=False,
        ),
    )


def downgrade() -> None:
    # Removing updated_at column from invoices table
    op.drop_column("invoices", "updated_at")
