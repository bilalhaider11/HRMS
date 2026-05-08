"""
create_employee_evaluation

Revision ID: 0005_create_employee_evaluation
Revises: 0004_role_system
Create Date: 2026-05-06
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0005_create_employee_evaluation"
down_revision: Union[str, Sequence[str], None] = "0004_add_role_fk"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # 1. Create roles table
    op.create_table(
        "employee_evaluation",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("employee_id", sa.Integer(), nullable=False, default=0),
        sa.Column("task_completion", sa.Integer(),nullable=False, default=0),
        sa.Column("team_player", sa.Integer(),nullable=False, default=0),
        sa.Column("time_management", sa.Integer(),nullable=False, default=0),
        sa.Column("positive_work_attitide", sa.Integer(),nullable=False, default=0),
        sa.Column("adaptable_and_flexible", sa.Integer(),nullable=False, default=0),
        sa.Column("ability_to_learn", sa.Integer(),nullable=False, default=0),
        sa.Column("problem_solving", sa.Integer(),nullable=False, default=0),
        sa.Column("punctuality", sa.Integer(),nullable=False, default=0),
        sa.Column("general_comments", sa.String(length=50), nullable=False),
        sa.Column("extra_comments", sa.String(length=150), nullable=True, default=None),
        
        sa.Column("created_by", sa.String(length=50), nullable=False, default='admin'),
        sa.Column("updated_by", sa.String(length=50), nullable=False, default='admin'),
        
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now(), nullable=False),
        
        sa.ForeignKeyConstraint(["employee_id"], ["employee.id"], ondelete="CASCADE"),
    )


def downgrade() -> None:

    # 4. Drop roles table
    op.drop_table("employee_evaluation")