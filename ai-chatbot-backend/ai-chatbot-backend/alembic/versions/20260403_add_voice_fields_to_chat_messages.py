"""add voice fields to chat_messages

Revision ID: 20260403_add_voice_fields_to_chat_messages
Revises: 20260324_tenant_subscription_plan_type_update
Create Date: 2026-04-03 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '20260403_add_voice_fields_to_chat_messages'
down_revision = '20260324_tenant_subscription_plan_type_update'
branch_labels = None
depends_on = None


def upgrade():
    # Add audio_file_path to store relative path to the saved audio clip
    op.add_column(
        'chat_messages',
        sa.Column('audio_file_path', sa.String(512), nullable=True)
    )
    # Add is_voice_message flag so the frontend can render a mic indicator
    op.add_column(
        'chat_messages',
        sa.Column('is_voice_message', sa.Boolean(), nullable=False, server_default='0')
    )


def downgrade():
    op.drop_column('chat_messages', 'is_voice_message')
    op.drop_column('chat_messages', 'audio_file_path')
