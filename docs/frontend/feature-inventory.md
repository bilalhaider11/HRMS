# Frontend: Inventory Feature

**Location**: `src/features/inventory/`

Manages two sub-entities: **Categories** and **Items**.

## Files

| File | Description |
|------|-------------|
| `modal/InventoryContext.tsx` | Single context managing both entity types |
| `api/inventory.ts` | Data fetching from dummy JSON (2 separate fetch functions) |
| `ui/` | Category and item page components |

## Data Interfaces

### `CategoryTableData`
```typescript
{
  categoryId?: number;
  categoryName?: string;
  categoryDescription?: string;
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
}
```

## Context API (`useInventory()`)

### State
| State | Type | Description |
|-------|------|-------------|
| `categoryList` | `CategoryTableData[]` | All categories |
| `itemsList` | `ItemsTableData[]` | All items |
| `editingCategory` | `CategoryTableData \| null` | Currently editing category |
| `editingItems` | `ItemsTableData \| null` | Currently editing item |
| `idExistError` | `string` | Error message |
| `successfullModal` | `boolean` | Show success modal |
| `isDeleteCategoryModal` | `CategoryTableData \| null` | Category delete confirmation |
| `isDeleteItemsModal` | `ItemsTableData \| null` | Item delete confirmation |

### Actions
Full CRUD for each entity: `addCategory`/`updateCategory`/`editCategoryData`/`handleCategoryDelete`, same pattern for Item.

- `addCategory` and `addItem` do not check duplicates on frontend

## API Layer
- `fetchCategoryTableData()` -> `/dummy_json_data/inventory_json_data/categoryTable.json`
- `fetchItemsTableData()` -> `/dummy_json_data/inventory_json_data/itemsTable.json`

## Routes
| Path | Component |
|------|-----------|
| `/inventory` | InventoryBodyPage |
| `/inventory/categories` | InventoryCategoriesPage |
| `/inventory/new-category` | NewInventoryCategoryPage |
| `/inventory/update-category/:categoryId` | UpdateInventoryCategoryPage |
| `/inventory/items` | InventoryItemsPage |
| `/inventory/new-items` | NewInventoryItemsPage |
| `/inventory/update-items/:itemId` | UpdateInventoryItemPage |

## Two-Level Hierarchy
Category -> Item. Each level has separate list, create, and update pages. All managed by a single `InventoryContext`.
