export interface CategoryTableData {
  categoryId: number,
  categoryName: string,
  categoryDescription: string
}

export interface ItemsTableData {
  itemId: number,
  itemName: string,
  itemDescription: string,
  itemQuantity: number,
  categoryId: number
}

export interface CategoryListData {
  categoryAllList: CategoryTableData[]
}
export interface ItemsListData {
  itemsAllList: ItemsTableData[]
}


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
