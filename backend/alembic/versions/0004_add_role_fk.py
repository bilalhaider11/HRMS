"""
create_roles_and_migrate_employee_to_role_ids

Revision ID: 0004_role_system
Revises: 0003_add_soft_delete
Create Date: 2026-05-04
"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


revision: str = "0004_add_role_fk"
down_revision: Union[str, Sequence[str], None] = "0003_add_soft_delete"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    # 1. Create roles table
    op.create_table(
        "roles",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("role_name", sa.String(length=50), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
    )

    # 2. Add role_ids (NEW FINAL STRUCTURE)
    op.add_column(
        "employee",
        sa.Column(
            "role_ids",
            sa.JSON(),
            nullable=False,
            server_default="[]",
        ),
    )

def downgrade() -> None:

    # 3. Drop new column
    op.drop_column("employee", "role_ids")

    # 4. Drop roles table
    op.drop_table("roles")