from fastapi import HTTPException
from sqlmodel import select
from models import Admin, Store, ItemCategory, StoreItems
from sqlmodel import Session

# ---------------- STORE CRUD ----------------
def create_new_store_in_db(store, session: Session):
    # Validate store input
    if store.name == 'string':
        raise HTTPException(status_code=400, detail="Enter store name")
    if store.unique_identifier == 'string':
        raise HTTPException(status_code=400, detail="Enter unique_identifier for this store")
    
    # Check if store already exists
    existing = session.exec(select(Store).where(Store.unique_identifier == store.unique_identifier)).first()
    if existing:
        raise HTTPException(status_code=409, detail="Store already exists")
    
    # Save store in DB
    store = Store.model_validate(store)
    session.add(store)
    session.commit()
    session.refresh(store)
    return store.id


def update_store_details_in_db(store_id, store, session: Session):
    existing = session.exec(select(Store).where(Store.id == store_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Store does not exist")
    
    if store.name != 'string':
        existing.name = store.name
    if store.unique_identifier != 'string':
        existing.unique_identifier = store.unique_identifier
    if store.description != 'string':
        existing.description = store.description
    
    session.commit()
    session.refresh(existing)
    return existing


def get_all_stores_in_db(page, page_size, session: Session):
    all_stores = session.exec(select(Store)).all()
    total_count = len(all_stores)
    
    offset = (page - 1) * page_size
    paginated_stores = all_stores[offset:offset + page_size]
    
    if not paginated_stores:
        raise HTTPException(status_code=404, detail="No stores found")
    
    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "stores": paginated_stores
    }


def get_store_by_id_in_db(store_id, session: Session):
    store = session.exec(select(Store).where(Store.id == store_id)).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store not found")
    return store


# ---------------- ITEM CATEGORY CRUD ----------------
def create_new_category_for_store_items_in_db(item_category, session: Session):
    if item_category.name == 'string':
        raise HTTPException(status_code=400, detail="Enter category name")
    if item_category.store_id == 0:
        raise HTTPException(status_code=400, detail="Enter store ID")
    
    store = session.exec(select(Store).where(Store.id == item_category.store_id)).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store does not exist")
    
    existing = session.exec(
        select(ItemCategory).where(
            ItemCategory.name == item_category.name,
            ItemCategory.store_id == item_category.store_id
        )
    ).first()
    
    if existing:
        raise HTTPException(status_code=409, detail="Item Category already exists")
    
    new_category = ItemCategory(**item_category.model_dump())
    session.add(new_category)
    
    try:
        session.commit()
        session.refresh(new_category)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {e}")
    
    return new_category.id


def update_category_for_store_items_in_db(item_category_id, item_category, session: Session):
    existing = session.exec(select(ItemCategory).where(ItemCategory.id == item_category_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item Category does not exist")
    
    if item_category.name != 'string':
        existing.name = item_category.name
    if item_category.description != 'string':
        existing.description = item_category.description
    if item_category.store_id != 0:
        store = session.exec(select(Store).where(Store.id == item_category.store_id)).first()
        if not store:
            raise HTTPException(status_code=404, detail="Store does not exist")
        existing.store_id = item_category.store_id
    
    try:
        session.commit()
        session.refresh(existing)
    except Exception as e:
        session.rollback()
        raise HTTPException(status_code=500, detail=f"DB commit failed: {e}")
    
    return existing


def get_category_by_id_in_db(item_category_id, store_id: int, session: Session):
    existing = session.exec(
        select(ItemCategory).where(
            (ItemCategory.id == item_category_id) &
            (ItemCategory.store_id == store_id)
        )
    ).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item Category does not exist in this store")
    return existing


def get_all_categories_in_db(page, page_size, store_id, session: Session):
    query = select(ItemCategory)
    if store_id:
        query = query.where(ItemCategory.store_id == store_id)
    
    all_categories = session.exec(query).all()
    total_count = len(all_categories)
    
    offset = (page - 1) * page_size
    paginated_categories = all_categories[offset:offset + page_size]
    
    if not paginated_categories:
        raise HTTPException(status_code=404, detail="No categories found")
    
    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "categories": paginated_categories
    }


# ---------------- STORE ITEMS CRUD ----------------
def create_store_item_in_db(item, session: Session):
    if item.name == 'string':
        raise HTTPException(status_code=400, detail="Enter item name")
    if item.quantity == 0:
        raise HTTPException(status_code=400, detail="Enter quantity")
    
    store = session.exec(select(Store).where(Store.id == item.store_id)).first()
    if not store:
        raise HTTPException(status_code=404, detail="Store does not exist")
    
    category = session.exec(select(ItemCategory).where(
        ItemCategory.id == item.category_id,
        ItemCategory.store_id == item.store_id
    )).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category does not exist in store")
    
    existing = session.exec(select(StoreItems).where(
        StoreItems.name == item.name,
        StoreItems.store_id == item.store_id,
        StoreItems.category_id == item.category_id
    )).first()
    if existing:
        raise HTTPException(status_code=409, detail="Item already exists in store")
    
    item = StoreItems.model_validate(item)
    session.add(item)
    session.commit()
    session.refresh(item)
    return item.id


def update_store_item_in_db(item_id, item, session: Session):
    existing = session.exec(select(StoreItems).where(StoreItems.id == item_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item does not exist")
    
    if item.name != 'string':
        existing.name = item.name
    if item.quantity != 0:
        existing.quantity = item.quantity
    if item.store_id != 0:
        existing.store_id = item.store_id
    if item.category_id != 0:
        existing.category_id = item.category_id
    
    session.commit()
    session.refresh(existing)
    return existing


def get_store_item_by_id_in_db(item_id, session: Session):
    existing = session.exec(select(StoreItems).where(StoreItems.id == item_id)).first()
    if not existing:
        raise HTTPException(status_code=404, detail="Item does not exist")
    return existing


def get_store_items_in_db(page, page_size, category_id, store_id, session: Session):
    query = select(StoreItems)
    if category_id:
        query = query.where(StoreItems.category_id == category_id)
    if store_id:
        query = query.where(StoreItems.store_id == store_id)
    
    all_items = session.exec(query).all()
    total_count = len(all_items)
    
    offset = (page - 1) * page_size
    paginated_items = all_items[offset:offset + page_size]
    
    if not paginated_items:
        raise HTTPException(status_code=404, detail="No items found")
    
    return {
        "page": page,
        "page_size": page_size,
        "total_count": total_count,
        "total_pages": (total_count + page_size - 1) // page_size,
        "items": paginated_items
    }