"""stripe hardening

Revision ID: 20260318_stripe_hardening
Revises: 20260318_invoice_updated_at
Create Date: 2026-03-18 18:50:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '20260318_stripe_hardening'
down_revision = '20260318_invoice_updated_at'
branch_labels = None
depends_on = None

def upgrade():
    # 1. Create stripe_event_logs table
    op.create_table('stripe_event_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('stripe_event_id', sa.String(length=255), nullable=False),
        sa.Column('event_type', sa.String(length=255), nullable=False),
        sa.Column('processed', sa.Boolean(), nullable=False, server_default='0'),
        sa.Column('processed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('payload', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stripe_event_id')
    )
    op.create_index('idx_stripe_event_id', 'stripe_event_logs', ['stripe_event_id'])

    # 2. Update subscriptions table
    # Add new columns
    op.add_column('subscriptions', sa.Column('stripe_checkout_session_id', sa.String(length=255), nullable=True))
    op.add_column('subscriptions', sa.Column('stripe_price_id', sa.String(length=255), nullable=True))
    op.add_column('subscriptions', sa.Column('stripe_product_id', sa.String(length=255), nullable=True))
    op.add_column('subscriptions', sa.Column('cancel_at_period_end', sa.Boolean(), nullable=False, server_default='0'))
    op.add_column('subscriptions', sa.Column('last_invoice_id', sa.String(length=255), nullable=True))
    op.add_column('subscriptions', sa.Column('last_payment_at', sa.DateTime(timezone=True), nullable=True))

    # Add unique constraint to stripe_subscription_id and stripe_checkout_session_id
    op.create_unique_constraint('uq_stripe_subscription_id', 'subscriptions', ['stripe_subscription_id'])
    op.create_unique_constraint('uq_stripe_checkout_session_id', 'subscriptions', ['stripe_checkout_session_id'])
    op.create_index('idx_subscription_checkout_session', 'subscriptions', ['stripe_checkout_session_id'])

    # Expand subscription_status enum (MySQL specific)
    op.execute("ALTER TABLE subscriptions MODIFY COLUMN subscription_status ENUM('active', 'cancelled', 'expired', 'past_due', 'created', 'paused', 'trialing', 'unpaid', 'incomplete', 'incomplete_expired') DEFAULT 'active'")

    # 3. Update invoices table
    op.add_column('invoices', sa.Column('stripe_subscription_id', sa.String(length=255), nullable=True))
    op.add_column('invoices', sa.Column('stripe_customer_id', sa.String(length=255), nullable=True))
    op.add_column('invoices', sa.Column('billing_reason', sa.String(length=100), nullable=True))
    op.add_column('invoices', sa.Column('period_start', sa.DateTime(timezone=True), nullable=True))
    op.add_column('invoices', sa.Column('period_end', sa.DateTime(timezone=True), nullable=True))
    op.add_column('invoices', sa.Column('hosted_invoice_url', sa.Text(), nullable=True))
    op.add_column('invoices', sa.Column('invoice_pdf', sa.Text(), nullable=True))
    op.add_column('invoices', sa.Column('raw_payload', sa.JSON(), nullable=True))

    # Update indexes for invoices
    op.create_index('idx_invoice_stripe_sub_id', 'invoices', ['stripe_subscription_id'])
    op.create_index('idx_invoice_stripe_cust_id', 'invoices', ['stripe_customer_id'])

def downgrade():
    op.drop_index('idx_invoice_stripe_cust_id', table_name='invoices')
    op.drop_index('idx_invoice_stripe_sub_id', table_name='invoices')
    op.drop_column('invoices', 'raw_payload')
    op.drop_column('invoices', 'invoice_pdf')
    op.drop_column('invoices', 'hosted_invoice_url')
    op.drop_column('invoices', 'period_end')
    op.drop_column('invoices', 'period_start')
    op.drop_column('invoices', 'billing_reason')
    op.drop_column('invoices', 'stripe_customer_id')
    op.drop_column('invoices', 'stripe_subscription_id')

    op.drop_index('idx_subscription_checkout_session', table_name='subscriptions')
    op.drop_constraint('uq_stripe_checkout_session_id', 'subscriptions', type_='unique')
    op.drop_constraint('uq_stripe_subscription_id', 'subscriptions', type_='unique')
    op.drop_column('subscriptions', 'last_payment_at')
    op.drop_column('subscriptions', 'last_invoice_id')
    op.drop_column('subscriptions', 'cancel_at_period_end')
    op.drop_column('subscriptions', 'stripe_product_id')
    op.drop_column('subscriptions', 'stripe_price_id')
    op.drop_column('subscriptions', 'stripe_checkout_session_id')

    op.drop_index('idx_stripe_event_id', table_name='stripe_event_logs')
    op.drop_table('stripe_event_logs')
