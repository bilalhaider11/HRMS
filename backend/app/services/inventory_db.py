# inventory_db.py
from fastapi import HTTPException
from sqlmodel import select, func, Session
from app.models.inventory import InventoryItem, InventoryItemBase, InventoryItemUpdate, ItemCategory, ItemCategoryBase, ItemCategoryUpdate


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

    total_count = session.exec(select(func.count()).select_from(ItemCategory)).one()
    offset = (page - 1) * page_size
    paginated_categories = session.exec(select(ItemCategory).offset(offset).limit(page_size)).all()

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": max(1, (total_count + page_size - 1) // page_size),
        "categories": paginated_categories
    }


def delete_category_in_db(category_id: int, session: Session):
    existing = session.exec(select(ItemCategory).where(ItemCategory.id == category_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item Category does not exist")

    linked = session.exec(select(InventoryItem).where(InventoryItem.category_id == category_id)).first()
    if linked:
        raise HTTPException(status_code=409, detail="Cannot delete category — items are using it")

    session.delete(existing)
    session.commit()
    return {"message": "Category deleted successfully"}


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


def delete_item_in_db(item_id: int, session: Session):
    existing = session.exec(select(InventoryItem).where(InventoryItem.id == item_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item does not exist")
    session.delete(existing)
    session.commit()
    return {"message": "Item deleted successfully"}


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

    count_q = select(func.count()).select_from(InventoryItem)
    if category_id:
        count_q = count_q.where(InventoryItem.category_id == category_id)
    total_count = session.exec(count_q).one()

    item_q = select(InventoryItem)
    if category_id:
        item_q = item_q.where(InventoryItem.category_id == category_id)
    offset = (page - 1) * page_size
    paginated_items = session.exec(item_q.offset(offset).limit(page_size)).all()

    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": max(1, (total_count + page_size - 1) // page_size),
        "items": paginated_items
    }
