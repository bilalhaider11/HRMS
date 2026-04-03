# inventory_db.py
from fastapi import HTTPException
from sqlmodel import select, Session
from models import ItemCategory, ItemCategoryBase, ItemCategoryUpdate, InventoryItem, InventoryItemBase, InventoryItemUpdate


# ---------------- ITEM CATEGORY CRUD ----------------

def create_category_in_db(category: ItemCategoryBase, session: Session):
    if category.name in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter category name")

    existing = session.exec(
        select(ItemCategory).where(ItemCategory.name == category.name)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Item Category already exists")

    new_category = ItemCategory.model_validate(category)
    session.add(new_category)
    session.commit()
    session.refresh(new_category)
    return new_category


def update_category_in_db(category_id: int, category: ItemCategoryUpdate, session: Session):
    existing = session.exec(select(ItemCategory).where(ItemCategory.id == category_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item Category does not exist")

    update_data = category.model_dump(exclude_unset=True)

    # Validate name if being changed
    if "name" in update_data and update_data["name"] is not None:
        if update_data["name"] in ("", "string"):
            raise HTTPException(status_code=400, detail="Enter a valid category name")

    for key, value in update_data.items():
        if value is not None:
            setattr(existing, key, value)

    session.commit()
    session.refresh(existing)
    return existing


def get_category_by_id_in_db(category_id: int, session: Session):
    existing = session.exec(select(ItemCategory).where(ItemCategory.id == category_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item Category does not exist")
    return existing


def get_all_categories_in_db(page: int, page_size: int, session: Session):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    all_categories = session.exec(select(ItemCategory)).all()
    total_count = len(all_categories)

    offset = (page - 1) * page_size
    paginated_categories = all_categories[offset:offset + page_size]

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "categories": paginated_categories
    }


# ---------------- INVENTORY ITEMS CRUD ----------------

def create_item_in_db(item: InventoryItemBase, session: Session):
    if item.name in ("", "string"):
        raise HTTPException(status_code=400, detail="Enter item name")
    if item.quantity < 1:
        raise HTTPException(status_code=400, detail="Quantity must be at least 1")
    if item.category_id == 0:
        raise HTTPException(status_code=400, detail="Enter category ID")

    # Validate category exists
    category = session.exec(select(ItemCategory).where(ItemCategory.id == item.category_id)).first()
    if not category:
        raise HTTPException(status_code=404, detail=f"Category with id {item.category_id} does not exist")

    # Check duplicate by name + category
    existing = session.exec(select(InventoryItem).where(
        InventoryItem.name == item.name,
        InventoryItem.category_id == item.category_id
    )).first()
    if existing:
        raise HTTPException(status_code=409, detail="Item already exists in this category")

    new_item = InventoryItem.model_validate(item)
    session.add(new_item)
    session.commit()
    session.refresh(new_item)
    return new_item


def update_item_in_db(item_id: int, item: InventoryItemUpdate, session: Session):
    existing = session.exec(select(InventoryItem).where(InventoryItem.id == item_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item does not exist")

    update_data = item.model_dump(exclude_unset=True)

    # Validate values if being changed
    if "name" in update_data and update_data["name"] is not None:
        if update_data["name"] in ("", "string"):
            raise HTTPException(status_code=400, detail="Enter a valid item name")
    if "quantity" in update_data and update_data["quantity"] is not None:
        if update_data["quantity"] < 0:
            raise HTTPException(status_code=400, detail="Quantity cannot be negative")

    # Validate category if being changed
    if "category_id" in update_data and update_data["category_id"] is not None:
        category = session.exec(select(ItemCategory).where(
            ItemCategory.id == update_data["category_id"]
        )).first()
        if not category:
            raise HTTPException(status_code=404, detail=f"Category with id {update_data['category_id']} does not exist")

    for key, value in update_data.items():
        if value is not None:
            setattr(existing, key, value)

    session.commit()
    session.refresh(existing)
    return existing


def get_item_by_id_in_db(item_id: int, session: Session):
    existing = session.exec(select(InventoryItem).where(InventoryItem.id == item_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item does not exist")
    return existing


def get_all_items_in_db(page: int, page_size: int, category_id: int = None, session: Session = None):
    if page < 1:
        page = 1
    if page_size < 1:
        page_size = 10

    query = select(InventoryItem)
    if category_id:
        query = query.where(InventoryItem.category_id == category_id)

    all_items = session.exec(query).all()
    total_count = len(all_items)

    offset = (page - 1) * page_size
    paginated_items = all_items[offset:offset + page_size]

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "items": paginated_items
    }
