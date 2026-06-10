"""
0007_updated_at_evaluation


Revision ID: 0007_updated_at_evaluation
Revises: 0006_add_is_income
Create Date: 2026-06-10
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0007_updated_at_evaluation"
down_revision: Union[str, Sequence[str], None] = "0006_add_is_income"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "employee_evaluation",
        sa.Column("updated_at",  sa.DateTime(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("employee_evaluation", "updated_at")
