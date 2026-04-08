"""add opening_balance to admin

Revision ID: a1b2c3d4e5f6
Revises: 0222896a20c0
Create Date: 2026-04-07 10:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '0222896a20c0'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('admin', sa.Column('opening_balance', sa.Float(), nullable=False, server_default='0.0'))
    # cheque_number was made Optional in the model but the initial migration created it NOT NULL
    op.alter_column('finance', 'cheque_number', nullable=True)


def downgrade() -> None:
    op.alter_column('finance', 'cheque_number', nullable=False)
    op.drop_column('admin', 'opening_balance')
