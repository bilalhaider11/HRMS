import { Navigate, Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import RegisterEmployeesPage from "../pages/RegisterEmployeesPage";
import Setting from "../pages/Settings";
import EmployeesPage from "../pages/EmployeesPage";
import UpdateEmployeesPage from "../pages/UpdateEmployeesPage";
import IncreamentHistoryPage from "../pages/IncreamentHistoryPage";
import FinancePage from "../pages/FinancePage";
import NewFinancePage from "../pages/NewFinancePage";
import UpdateFinancePage from "../pages/UpdateFinancePage";
import CategoryListsPage from "../pages/CategoryListsPage";
import NewCategoryPage from "../pages/NewCategoryPage";
import UpdateCategoryPage from "../pages/UpdateCategoryPage";
import InventoryBodyPage from "../pages/InventoryBodyPage";
import StorePage from "../pages/StorePage";
import NewStorePage from "../pages/NewStorePage";
import InventoryCategoriesPage from "../pages/InventoryCategoriesPage";
import UpdateStorePage from "../pages/UpdateStorePage";
import NewInventoryCategoryPage from "../pages/NewInventoryCategoryPage";
import UpdateInventoryCategoryPage from "../pages/UpdateInventoryCategoryPage";
import InventoryItemsPage from "../pages/InventoryItemsPage";
import NewInventoryItemsPage from "../pages/NewInventoryItemsPage";
import UpdateInventoryItemPage from "../pages/UpdateInventoryItemPage";
import TeamPage from "../pages/TeamPage";
import NewTeamPage from "../pages/NewTeamPage";
import UpdateTeamsPage from "../pages/UpdateTeamsPage";

interface UserPageProps {
  name: string;
  superAdmin: boolean;
}

export default function UserPage({ superAdmin }: UserPageProps) {
  return (
    <>
      <Routes>
        {/* {!superAdmin && (
          <>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/" element={<Dashboard />} />
          </>
        )} */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={<EmployeesPage />} />
        <Route path="/employees/register-employees" element={<RegisterEmployeesPage />} />
        <Route path="/employees/update-employees/:employeeId" element={<UpdateEmployeesPage />} />
        <Route path="/employees/increament-history/:employeeId" element={<IncreamentHistoryPage />} />
        <Route path="/finance" element={<FinancePage />} />
        <Route path="/finance/new-finance" element={<NewFinancePage />} />
        <Route path="/finance/update-finance/:financeId" element={<UpdateFinancePage />} />
        <Route path="/finance/category-lists" element={<CategoryListsPage />} />
        <Route path="/finance/category-lists/new-category" element={<NewCategoryPage />} />
        <Route path="/finance/category-lists/update-category/:categoryId" element={<UpdateCategoryPage />} />
        <Route path="/inventory" element={<InventoryBodyPage />} />
        <Route path="/inventory/stores" element={<StorePage />} />
        <Route path="/inventory/new-store" element={<NewStorePage />} />
        <Route path="/inventory/update-store/:storeId" element={<UpdateStorePage />} />
        <Route path="/inventory/categories" element={<InventoryCategoriesPage />} />
        <Route path="/inventory/new-category" element={<NewInventoryCategoryPage />} />
        <Route path="/inventory/update-category/:categoryId" element={<UpdateInventoryCategoryPage />} />
        <Route path="/inventory/items" element={<InventoryItemsPage />} />
        <Route path="/inventory/new-items" element={<NewInventoryItemsPage />} />
        <Route path="/inventory/update-items/:itemId" element={<UpdateInventoryItemPage />} />
        <Route path="/teams" element={<TeamPage />} />
        <Route path="/teams/new-team" element={<NewTeamPage />} />
        <Route path="/teams/update-team/:teamId" element={<UpdateTeamsPage />} />
        <Route path="/settings" element={<Setting />} />
      </Routes>

      {/* {superAdmin ? (
        <>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </>
      ) : null} */}
    </>
  );
}
