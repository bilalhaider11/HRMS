from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.services import admin_db
from app.services import auth
from app.services import inventory_db
from app.models.inventory import ItemCategoryBase, ItemCategoryUpdate, InventoryItemBase, InventoryItemUpdate

router = APIRouter(prefix="/inventory", dependencies=[Depends(auth.get_current_user)])


@router.post("/create_category")
def create_category(category: ItemCategoryBase, session: Session = Depends(admin_db.get_session)):
    return inventory_db.create_category_in_db(category, session=session)


@router.patch("/update_category/{category_id}")
def update_category(category_id: int, category: ItemCategoryUpdate, session: Session = Depends(admin_db.get_session)):
    return inventory_db.update_category_in_db(category_id, category, session=session)


@router.get("/get_category/{category_id}")
def get_category(category_id: int, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_category_by_id_in_db(category_id, session=session)


@router.get("/get_all_categories")
def get_all_categories(page: int = 1, page_size: int = 10, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_all_categories_in_db(page, page_size, session=session)


@router.post("/create_item")
def create_item(item: InventoryItemBase, session: Session = Depends(admin_db.get_session)):
    return inventory_db.create_item_in_db(item, session=session)


@router.patch("/update_item/{item_id}")
def update_item(item_id: int, item: InventoryItemUpdate, session: Session = Depends(admin_db.get_session)):
    return inventory_db.update_item_in_db(item_id, item, session=session)


@router.get("/get_item/{item_id}")
def get_item(item_id: int, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_item_by_id_in_db(item_id, session=session)


@router.get("/get_all_items")
def get_all_items(page: int = 1, page_size: int = 10, category_id: int | None = None, session: Session = Depends(admin_db.get_session)):
    return inventory_db.get_all_items_in_db(page, page_size, category_id, session=session)
