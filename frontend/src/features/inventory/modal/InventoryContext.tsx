import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCategoryTableData, fetchItemsTableData, fetchStoreTableData } from '../api/inventory';

export interface StoreTableData {
    id?: number,
    name?: string,
    uniqueIdentifier?: string,
    description?: string,
    companyId?: number
}

export interface CategoryTableData {
    categoryId?: number,
    categoryName?: string,
    categoryDescription?: string,
    companyId?: number,
    storeId?: number,
}

export interface ItemsTableData {
  itemId?: number,
  itemName?: string,
  itemDescription?: string,
  itemQuantity?: number,
  categoryId?: number
  storeId?: number
}

interface InventoryContextType {
    storeList: StoreTableData[];
    categoryList: CategoryTableData[];
    itemsList: ItemsTableData[];
    setEditingStore: (store: StoreTableData | null) => void;
    editingStore: StoreTableData | null;
    setEditingCategory: (category: CategoryTableData | null) => void;
    editingCategory: CategoryTableData | null;
    setEditingItems: (items: ItemsTableData | null) => void;
    editingItems: ItemsTableData | null;
    addStore: (store: StoreTableData) => boolean;
    addCategory: (category: CategoryTableData) => boolean;
    addItem: (item: ItemsTableData) => boolean;
    idExistError: string;
    clearError: () => void;
    successfullModal: boolean;
    setSuccessfullModal: (value: boolean) => void;
    isDeleteModal: StoreTableData | null
    setIsDeleteModal: (store: StoreTableData | null) => void
    setIsDeleteCategoryModal: (store: CategoryTableData | null) => void
    isDeleteCategoryModal: CategoryTableData | null
    setIsDeleteItemsModal: (item: ItemsTableData | null) => void
    isDeleteItemsModal: ItemsTableData | null
    updateStore: (store: StoreTableData) => void;
    updateCategory: (category: CategoryTableData) => void;
    updateItem: (item: ItemsTableData) => void
    editStoreData: (store: StoreTableData) => void;
    editCategoryData: (category: CategoryTableData) => void
    editItemData: (item: ItemsTableData) => void
    handleStoreDelete: (store: StoreTableData) => void;
    handleCategoryDelete: (category: CategoryTableData) => void
    handleItemDelete: (item: ItemsTableData) => void
}


const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const useInventory = () => {
    const context = useContext(InventoryContext);
    if (!context) {
        throw new Error('Error');
    }
    return context;
};

interface InventoryProviderProps {
    children: ReactNode;
}

export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
    const [storeList, setStoreList] = useState<StoreTableData[]>([]);
    const [categoryList, setCategoryList] = useState<CategoryTableData[]>([])
    const [itemsList, setItemsList] = useState<ItemsTableData[]>([])
    const [editingStore, setEditingStore] = useState<StoreTableData | null>(null);
    const [editingCategory, setEditingCategory] = useState<CategoryTableData | null>(null)
    const [editingItems, setEditingItems] = useState<ItemsTableData | null>(null)
    const [idExistError, setIdExistError] = useState("")
    const [successfullModal, setSuccessfullModal] = useState<boolean>(false)
    const [isDeleteModal, setIsDeleteModal] = useState<StoreTableData | null>(null);
    const [isDeleteCategoryModal, setIsDeleteCategoryModal] = useState<CategoryTableData | null> (null)
    const [isDeleteItemsModal, setIsDeleteItemsModal] = useState<ItemsTableData | null> (null)

    const clearError = () => setIdExistError("");

    useEffect(() => {
        const loadStore = async () => {
            try {
                const data = await fetchStoreTableData();
                setStoreList(data.storeAllList);
            } catch (error) {
                console.error(error);
            }
        };

        const loadCategory = async () => {
            try {
                const data = await fetchCategoryTableData();
                setCategoryList(data.categoryAllList)
            } catch (error) {
                console.log(error)
            }
        }

        const loadItems = async () => {
            try {
                const data = await fetchItemsTableData();
                setItemsList(data.itemsAllList)
            } catch (error) {
                console.log(error)
            }
        }

        loadStore()
        loadCategory()
        loadItems()

    }, []);

    const addStore = (store: StoreTableData) => {
        const exists = storeList.some(s => s.uniqueIdentifier === store.uniqueIdentifier);
        if (exists) {
            setIdExistError("Unique Name already exists. Please choose a different one.");
            return false;
        }

        const updatedList = [...storeList, store];
        console.log("added")
        setStoreList(updatedList);
        setEditingStore(null)
        setIdExistError("")
        setSuccessfullModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        return true

    };

    const editStoreData = (store: StoreTableData) => {
        console.log(store)
        setStoreList(prev => prev.map(s => s.id === store.id ? store : s));
        setEditingStore(store);
        setSuccessfullModal(false);
        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);
    };

    const updateStore = (updatedStore: StoreTableData) => {

        const updatedList = storeList.map((store) =>
            store.id === updatedStore.id ? updatedStore : store
        );
        console.log("updateList", updatedList)
        setStoreList(updatedList);
        setSuccessfullModal(true);
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        setIdExistError("");
    };

    const handleStoreDelete = (store: StoreTableData) => {
        const updatingList = storeList.filter(i => i.id !== store.id)
        setStoreList(updatingList)
        setIsDeleteModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    const addCategory = (category: CategoryTableData) => {
        const updatedCategoryList = [...categoryList, category];
        console.log("added")
        setCategoryList(updatedCategoryList);
        setEditingCategory(null)
        setIdExistError("")
        setSuccessfullModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        return true

    };

    const editCategoryData = (category: CategoryTableData) => {
        console.log(category)
        setCategoryList(prev => prev.map(c => c.categoryId === category.categoryId ? category : c));
        setEditingCategory(category);
        setSuccessfullModal(false);
        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);
    };

    const updateCategory = (updatedCategory: CategoryTableData) => {

        const updatedCategoryList = categoryList.map((category) =>
            category.categoryId === updatedCategory.categoryId ? updatedCategory : category
        );
        console.log("updateList", updatedCategoryList)
        setCategoryList(updatedCategoryList);
        setSuccessfullModal(true);
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        setIdExistError("");
    };

    const handleCategoryDelete = (category: CategoryTableData) => {
        const updatingList = categoryList.filter(i => i.categoryId !== category.categoryId)
        setCategoryList(updatingList)
        setIsDeleteCategoryModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }

    const addItem = (item: ItemsTableData) => {
        const updatedItemList = [...itemsList, item];
        console.log("added")
        setItemsList(updatedItemList);
        setEditingItems(null)
        setIdExistError("")
        setSuccessfullModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        return true
    };
      const editItemData = (item: ItemsTableData) => {
        console.log(item)
        setItemsList(prev => prev.map(i => i.itemId === item.itemId ? item : i));
        setEditingItems(item);
        setSuccessfullModal(false);
        document.body.style.overflow = "auto";
        window.scrollTo(0, 0);
    };

      const updateItem = (updatedItem: ItemsTableData) => {
        const updatedItemList = itemsList.map((item) =>
            item.itemId === updatedItem.itemId ? updatedItem : item
        );
        console.log("updateList", updatedItemList)
        setItemsList(updatedItemList);
        setSuccessfullModal(true);
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        setIdExistError("");
    };

     const handleItemDelete = (item: ItemsTableData) => {
        const updatingList = itemsList.filter(i => i.itemId !== item.itemId)
        setItemsList(updatingList)
        setIsDeleteCategoryModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }


    return (
        <InventoryContext.Provider value={{ storeList, setEditingStore, editingStore, setIsDeleteModal, isDeleteModal, isDeleteCategoryModal, setIsDeleteCategoryModal, setSuccessfullModal, successfullModal, idExistError, addStore, updateStore, handleStoreDelete, editStoreData, clearError, categoryList, editCategoryData, editingCategory, setEditingCategory, updateCategory, addCategory, handleCategoryDelete, addItem, setEditingItems, itemsList, editingItems, editItemData, updateItem, handleItemDelete, setIsDeleteItemsModal, isDeleteItemsModal }}>
            {children}
        </InventoryContext.Provider>
    );
};
