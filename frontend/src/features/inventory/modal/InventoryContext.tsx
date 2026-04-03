import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchCategoryTableData, fetchItemsTableData } from '../api/inventory';

export interface CategoryTableData {
    categoryId?: number,
    categoryName?: string,
    categoryDescription?: string
}

export interface ItemsTableData {
  itemId?: number,
  itemName?: string,
  itemDescription?: string,
  itemQuantity?: number,
  categoryId?: number
}

interface InventoryContextType {
    categoryList: CategoryTableData[];
    itemsList: ItemsTableData[];
    setEditingCategory: (category: CategoryTableData | null) => void;
    editingCategory: CategoryTableData | null;
    setEditingItems: (items: ItemsTableData | null) => void;
    editingItems: ItemsTableData | null;
    addCategory: (category: CategoryTableData) => boolean;
    addItem: (item: ItemsTableData) => boolean;
    idExistError: string;
    clearError: () => void;
    successfullModal: boolean;
    setSuccessfullModal: (value: boolean) => void;
    setIsDeleteCategoryModal: (category: CategoryTableData | null) => void
    isDeleteCategoryModal: CategoryTableData | null
    setIsDeleteItemsModal: (item: ItemsTableData | null) => void
    isDeleteItemsModal: ItemsTableData | null
    updateCategory: (category: CategoryTableData) => void;
    updateItem: (item: ItemsTableData) => void
    editCategoryData: (category: CategoryTableData) => void
    editItemData: (item: ItemsTableData) => void
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
    const [categoryList, setCategoryList] = useState<CategoryTableData[]>([])
    const [itemsList, setItemsList] = useState<ItemsTableData[]>([])
    const [editingCategory, setEditingCategory] = useState<CategoryTableData | null>(null)
    const [editingItems, setEditingItems] = useState<ItemsTableData | null>(null)
    const [idExistError, setIdExistError] = useState("")
    const [successfullModal, setSuccessfullModal] = useState<boolean>(false)
    const [isDeleteCategoryModal, setIsDeleteCategoryModal] = useState<CategoryTableData | null> (null)
    const [isDeleteItemsModal, setIsDeleteItemsModal] = useState<ItemsTableData | null> (null)

    const clearError = () => setIdExistError("");

    useEffect(() => {
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

        loadCategory()
        loadItems()

    }, []);

    const addCategory = (category: CategoryTableData) => {
        const updatedCategoryList = [...categoryList, category];
        setCategoryList(updatedCategoryList);
        setEditingCategory(null)
        setIdExistError("")
        setSuccessfullModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        return true
    };

    const editCategoryData = (category: CategoryTableData) => {
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
        setItemsList(updatedItemList);
        setEditingItems(null)
        setIdExistError("")
        setSuccessfullModal(true)
        window.scrollTo(0, 0);
        document.body.style.overflow = "hidden"
        return true
    };

    const editItemData = (item: ItemsTableData) => {
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
        setItemsList(updatedItemList);
        setSuccessfullModal(true);
        document.body.style.overflow = "hidden";
        window.scrollTo(0, 0);
        setIdExistError("");
    };

    const handleItemDelete = (item: ItemsTableData) => {
        const updatingList = itemsList.filter(i => i.itemId !== item.itemId)
        setItemsList(updatingList)
        setIsDeleteItemsModal(null)
        window.scrollTo(0, 0);
        document.body.style.overflow = "auto"
    }


    return (
        <InventoryContext.Provider value={{ isDeleteCategoryModal, setIsDeleteCategoryModal, setSuccessfullModal, successfullModal, idExistError, clearError, categoryList, editCategoryData, editingCategory, setEditingCategory, updateCategory, addCategory, handleCategoryDelete, addItem, setEditingItems, itemsList, editingItems, editItemData, updateItem, handleItemDelete, setIsDeleteItemsModal, isDeleteItemsModal }}>
            {children}
        </InventoryContext.Provider>
    );
};
