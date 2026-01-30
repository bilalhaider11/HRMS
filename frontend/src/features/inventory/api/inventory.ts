export interface StoreTableData {
  id: number,
  name: string,
  uniqueIdentifier: string,
  description: string,
  companyId: number
}

export interface CategoryTableData {
  categoryId: number,
  categoryName: string,
  categoryDescription: string,
  companyId: number,
  storeId: number,
}

export interface ItemsTableData {
  itemId: number,
  itemName: string,
  itemDescription: string,
  itemQuantity: number,
  categoryId: number
  storeId: number
}

export interface StoreListData {
  storeAllList: StoreTableData[]
}

export interface CategoryListData {
  categoryAllList: CategoryTableData[]
}
export interface ItemsListData {
  itemsAllList: ItemsTableData[]
}



export const fetchStoreTableData = async (): Promise<StoreListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/inventory_json_data/storeTable.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return { storeAllList: data.storeTable };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchCategoryTableData = async (): Promise<CategoryListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/inventory_json_data/categoryTable.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return { categoryAllList: data.categoryTable };
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const fetchItemsTableData = async (): Promise<ItemsListData> => {
  try {
    const response = await fetch(
      "/dummy_json_data/inventory_json_data/itemsTable.json"
    );
    if (!response.ok) {
      throw new Error(`${response.status}`);
    }
    const data = await response.json();
    return { itemsAllList: data.itemsTable };
  } catch (error) {
    console.error(error);
    throw error;
  }
};
