"""initial_schema

Revision ID: 0001_initial_schema
Revises:
Create Date: 2026-04-08 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision: str = '0001_initial_schema'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # admin
    op.create_table('admin',
        sa.Column('company_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('website', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('address', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('phone', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('access_key', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_admin_id'), 'admin', ['id'], unique=False)

    # bank_account
    op.create_table('bank_account',
        sa.Column('account_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('bank_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('account_number', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('branch_code', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('iban_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('opening_balance', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_bank_account_id'), 'bank_account', ['id'], unique=False)

    # attendance_raw
    op.create_table('attendance_raw',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('serial_number', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('employee_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('status', sa.Integer(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('date', sa.Date(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_attendance_raw_id'), 'attendance_raw', ['id'], unique=False)

    # employee
    op.create_table('employee',
        sa.Column('employee_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('bank_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('bank_account_title', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('bank_branch_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('bank_account_number', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('bank_iban_number', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('initial_base_salary', sa.Float(), nullable=False),
        sa.Column('current_base_salary', sa.Float(), nullable=False),
        sa.Column('date_of_joining', sa.Date(), nullable=False),
        sa.Column('fulltime_joining_date', sa.Date(), nullable=True),
        sa.Column('last_increment_date', sa.Date(), nullable=True),
        sa.Column('increment_amount', sa.Float(), nullable=False),
        sa.Column('department', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('home_address', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('email', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('password', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('designation', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('cnic', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=False),
        sa.Column('actual_date_of_birth', sa.Date(), nullable=True),
        sa.Column('hobbies', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('vehicle_registration_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('badge_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('profile_pic_url', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('status', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_employee_id'), 'employee', ['id'], unique=False)

    # financecategory
    op.create_table('financecategory',
        sa.Column('category_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('color_code', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('category_id'),
    )
    op.create_index(op.f('ix_financecategory_category_id'), 'financecategory', ['category_id'], unique=False)

    # item_category
    op.create_table('item_category',
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_item_category_id'), 'item_category', ['id'], unique=False)

    # jwt_tokens
    op.create_table('jwt_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('client_ip', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('token', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('created_at', sa.Date(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_jwt_tokens_id'), 'jwt_tokens', ['id'], unique=False)

    # employee_increment_history
    op.create_table('employee_increment_history',
        sa.Column('employee_id', sa.Integer(), nullable=False),
        sa.Column('increment_amount', sa.Float(), nullable=False),
        sa.Column('effective_date', sa.Date(), nullable=False),
        sa.Column('notes', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['employee_id'], ['employee.id']),
        sa.PrimaryKeyConstraint('id'),
    )

    # finance (with bank_account_id, cheque_number nullable)
    op.create_table('finance',
        sa.Column('date', sa.Date(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('amount', sa.Float(), nullable=False),
        sa.Column('tax_deductions', sa.Float(), nullable=False),
        sa.Column('cheque_number', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('bank_account_id', sa.Integer(), nullable=False),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('added_by', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['added_by'], ['admin.id']),
        sa.ForeignKeyConstraint(['category_id'], ['financecategory.category_id']),
        sa.ForeignKeyConstraint(['bank_account_id'], ['bank_account.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_finance_id'), 'finance', ['id'], unique=False)

    # finance_edit_history
    op.create_table('finance_edit_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('finance_id', sa.Integer(), nullable=False),
        sa.Column('field_name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('old_value', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('new_value', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('edited_by', sa.Integer(), nullable=True),
        sa.Column('edited_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['edited_by'], ['admin.id']),
        sa.ForeignKeyConstraint(['finance_id'], ['finance.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_finance_edit_history_id'), 'finance_edit_history', ['id'], unique=False)

    # store_items
    op.create_table('store_items',
        sa.Column('name', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('quantity', sa.Integer(), nullable=False),
        sa.Column('category_id', sa.Integer(), nullable=False),
        sa.Column('id', sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(['category_id'], ['item_category.id']),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_store_items_id'), 'store_items', ['id'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_store_items_id'), table_name='store_items')
    op.drop_table('store_items')
    op.drop_index(op.f('ix_finance_edit_history_id'), table_name='finance_edit_history')
    op.drop_table('finance_edit_history')
    op.drop_index(op.f('ix_finance_id'), table_name='finance')
    op.drop_table('finance')
    op.drop_table('employee_increment_history')
    op.drop_index(op.f('ix_jwt_tokens_id'), table_name='jwt_tokens')
    op.drop_table('jwt_tokens')
    op.drop_index(op.f('ix_item_category_id'), table_name='item_category')
    op.drop_table('item_category')
    op.drop_index(op.f('ix_financecategory_category_id'), table_name='financecategory')
    op.drop_table('financecategory')
    op.drop_index(op.f('ix_employee_id'), table_name='employee')
    op.drop_table('employee')
    op.drop_index(op.f('ix_attendance_raw_id'), table_name='attendance_raw')
    op.drop_table('attendance_raw')
    op.drop_index(op.f('ix_bank_account_id'), table_name='bank_account')
    op.drop_table('bank_account')
    op.drop_index(op.f('ix_admin_id'), table_name='admin')
    op.drop_table('admin')
