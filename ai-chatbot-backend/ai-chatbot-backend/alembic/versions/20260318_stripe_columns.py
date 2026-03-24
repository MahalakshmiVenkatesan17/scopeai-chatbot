"""Add stripe columns and fix enums for Stripe payment support.

Revision ID: 20260318_stripe
Revises: 
Create Date: 2026-03-18

Adds:
- subscriptions.stripe_subscription_id  (VARCHAR 255, nullable)
- subscriptions.stripe_customer_id      (VARCHAR 255, nullable)
- subscriptions.subscription_status enum: adds 'created', 'paused', 'trialing'
- invoices.stripe_invoice_id unique index (for webhook idempotency)
"""

from alembic import op
import sqlalchemy as sa

revision = "20260318_stripe"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Add stripe_subscription_id column ---
    op.add_column(
        "subscriptions",
        sa.Column("stripe_subscription_id", sa.String(255), nullable=True),
    )

    # --- Add stripe_customer_id column ---
    op.add_column(
        "subscriptions",
        sa.Column("stripe_customer_id", sa.String(255), nullable=True),
    )

    # --- Add indexes for new columns ---
    op.create_index(
        "idx_subscription_stripe_sub_id",
        "subscriptions",
        ["stripe_subscription_id"],
    )
    op.create_index(
        "idx_subscription_stripe_cust_id",
        "subscriptions",
        ["stripe_customer_id"],
    )

    # --- Expand subscription_status enum (MySQL requires MODIFY COLUMN) ---
    op.execute(
        "ALTER TABLE subscriptions MODIFY COLUMN subscription_status "
        "ENUM('active','cancelled','expired','past_due','created','paused','trialing') "
        "NOT NULL DEFAULT 'active'"
    )

    # --- Add unique index on invoices.stripe_invoice_id for idempotency ---
    # Use CREATE UNIQUE INDEX to avoid error if index already exists
    op.execute(
        "CREATE UNIQUE INDEX idx_invoice_stripe_id ON invoices (stripe_invoice_id)"
    )


def downgrade() -> None:
    # Remove unique index on stripe_invoice_id
    op.execute("DROP INDEX idx_invoice_stripe_id ON invoices")

    # Revert subscription_status enum
    op.execute(
        "ALTER TABLE subscriptions MODIFY COLUMN subscription_status "
        "ENUM('active','cancelled','expired','past_due') "
        "NOT NULL DEFAULT 'active'"
    )

    # Drop indexes and columns
    op.drop_index("idx_subscription_stripe_cust_id", table_name="subscriptions")
    op.drop_index("idx_subscription_stripe_sub_id", table_name="subscriptions")
    op.drop_column("subscriptions", "stripe_customer_id")
    op.drop_column("subscriptions", "stripe_subscription_id")
