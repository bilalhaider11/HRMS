"""create_teams_tables

Revision ID: 0002_create_teams
Revises: 0001_initial_schema
Create Date: 2026-04-27

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers
revision: str = '0002_create_teams'
down_revision: Union[str, Sequence[str], None] = '0001_initial_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ------------------ Teams Table ------------------
    op.create_table(
        'teams',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),
        sa.Column('team_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('team_description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),

        # team lead (employee reference)
        sa.Column('team_lead_id', sa.Integer(), nullable=True),

        # company reference (admin)
        sa.Column('company_id', sa.Integer(), nullable=True),

        sa.ForeignKeyConstraint(['team_lead_id'], ['employee.id']),
        sa.ForeignKeyConstraint(['company_id'], ['admin.id']),
    )
    op.create_index(op.f('ix_teams_id'), 'teams', ['id'], unique=False)

    # ------------------ Team Members Table ------------------
    op.create_table(
        'team_members',
        sa.Column('id', sa.Integer(), primary_key=True, nullable=False),

        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), nullable=False),

        sa.ForeignKeyConstraint(['team_id'], ['teams.id']),
        sa.ForeignKeyConstraint(['employee_id'], ['employee.id']),
    )
    op.create_index(op.f('ix_team_members_id'), 'team_members', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_team_members_id'), table_name='team_members')
    op.drop_table('team_members')

    op.drop_index(op.f('ix_teams_id'), table_name='teams')
    op.drop_table('teams')