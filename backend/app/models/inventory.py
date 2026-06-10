import datetime
from datetime import date
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship


# --- Inventory Models ---
class ItemCategoryBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None


class ItemCategory(ItemCategoryBase, table=True):
    __tablename__ = "item_category"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class ItemCategoryUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None


class InventoryItemBase(SQLModel):
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    quantity: int
    category_id: int = Field(foreign_key="item_category.id")


class InventoryItem(InventoryItemBase, table=True):
    __tablename__ = "store_items"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)


class InventoryItemUpdate(SQLModel):
    name: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[int] = None
    category_id: Optional[int] = None