# Frontend: Inventory Feature

**Location**: `src/features/inventory/`

The most complex frontend feature — manages three sub-entities: **Stores**, **Categories**, and **Items**.

## Files

| File | Description |
|------|-------------|
| `modal/InventoryContext.tsx` | Single context managing all three entity types |
| `api/inventory.ts` | Data fetching from dummy JSON (3 separate fetch functions) |
| `ui/` | Store, category, and item page components |

## Data Interfaces

### `StoreTableData`
```typescript
{
  id?: number;
  name?: string;
  uniqueIdentifier?: string;    // unique_identifier
  description?: string;
  companyId?: number;           // Frontend-only
}
```

### `CategoryTableData`
```typescript
{
  categoryId?: number;
  categoryName?: string;
  categoryDescription?: string;
  companyId?: number;           // Frontend-only
  storeId?: number;
}
```

### `ItemsTableData`
```typescript
{
  itemId?: number;
  itemName?: string;
  itemDescription?: string;
  itemQuantity?: number;
  categoryId?: number;
  storeId?: number;
}
```

## Context API (`useInventory()`)

### State
| State | Type | Description |
|-------|------|-------------|
| `storeList` | `StoreTableData[]` | All stores |
| `categoryList` | `CategoryTableData[]` | All categories |
| `itemsList` | `ItemsTableData[]` | All items |
| `editingStore` | `StoreTableData \| null` | Currently editing store |
| `editingCategory` | `CategoryTableData \| null` | Currently editing category |
| `editingItems` | `ItemsTableData \| null` | Currently editing item |
| `idExistError` | `string` | Error message |
| `successfullModal` | `boolean` | Show success modal |
| `isDeleteModal` | `StoreTableData \| null` | Store delete confirmation |
| `isDeleteCategoryModal` | `CategoryTableData \| null` | Category delete confirmation |
| `isDeleteItemsModal` | `ItemsTableData \| null` | Item delete confirmation |

### Actions
Full CRUD for each entity: `addStore`/`updateStore`/`editStoreData`/`handleStoreDelete`, same pattern for Category and Item.

- `addStore` checks `uniqueIdentifier` for duplicates (returns false if exists)
- `addCategory` and `addItem` do not check duplicates on frontend

## API Layer
- `fetchStoreTableData()` -> `/dummy_json_data/inventory_json_data/storeTable.json`
- `fetchCategoryTableData()` -> `/dummy_json_data/inventory_json_data/categoryTable.json`
- `fetchItemsTableData()` -> `/dummy_json_data/inventory_json_data/itemsTable.json`

## Routes
| Path | Component |
|------|-----------|
| `/inventory` | InventoryBodyPage |
| `/inventory/stores` | StorePage |
| `/inventory/new-store` | NewStorePage |
| `/inventory/update-store/:storeId` | UpdateStorePage |
| `/inventory/categories` | InventoryCategoriesPage |
| `/inventory/new-category` | NewInventoryCategoryPage |
| `/inventory/update-category/:categoryId` | UpdateInventoryCategoryPage |
| `/inventory/items` | InventoryItemsPage |
| `/inventory/new-items` | NewInventoryItemsPage |
| `/inventory/update-items/:itemId` | UpdateInventoryItemPage |

## Three-Level Hierarchy
Store -> Category -> Item. Each level has separate list, create, and update pages. All managed by a single `InventoryContext`.
