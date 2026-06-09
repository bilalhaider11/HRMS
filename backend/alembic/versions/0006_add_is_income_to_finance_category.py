"""
add_is_income_to_finance_category

Revision ID: 0006_add_is_income
Revises: 0005_create_employee_evaluation
Create Date: 2026-06-09
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0006_add_is_income"
down_revision: Union[str, Sequence[str], None] = "0005_create_employee_evaluation"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "financecategory",
        sa.Column("is_income", sa.Boolean(), nullable=False, server_default=sa.text("false")),
    )


def downgrade() -> None:
    op.drop_column("financecategory", "is_income")
