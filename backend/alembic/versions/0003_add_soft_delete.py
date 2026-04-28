"""add_soft_delete_to_teams

Revision ID: 0003_add_soft_delete
Revises: 0002_create_teams
Create Date: 2026-04-28

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision: str = '0003_add_soft_delete'
down_revision: Union[str, Sequence[str], None] = '0002_create_teams'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add soft delete column to teams
    op.add_column(
        'teams',
        sa.Column('delete_record', sa.Boolean(), nullable=False, server_default=sa.false())
    )

    # Add soft delete column to team_members
    op.add_column(
        'team_members',
        sa.Column('delete_record', sa.Boolean(), nullable=False, server_default=sa.false())
    )


def downgrade() -> None:
    # Remove columns (rollback)
    op.drop_column('team_members', 'delete_record')
    op.drop_column('teams', 'delete_record')