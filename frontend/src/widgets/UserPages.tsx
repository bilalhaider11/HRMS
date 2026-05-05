import { Route, Routes, Navigate } from "react-router-dom";
import { ReactElement } from "react";
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
import InventoryCategoriesPage from "../pages/InventoryCategoriesPage";
import NewInventoryCategoryPage from "../pages/NewInventoryCategoryPage";
import UpdateInventoryCategoryPage from "../pages/UpdateInventoryCategoryPage";
import InventoryItemsPage from "../pages/InventoryItemsPage";
import NewInventoryItemsPage from "../pages/NewInventoryItemsPage";
import UpdateInventoryItemPage from "../pages/UpdateInventoryItemPage";
import TeamPage from "../pages/TeamPage";
import NewTeamPage from "../pages/NewTeamPage";
import UpdateTeamsPage from "../pages/UpdateTeamsPage";
import TeamMembersPage from "../pages/TeamMembersPage";
import BankAccountsPage from "../pages/BankAccountsPage";
import AttendancePage from "../pages/AttendancePage";
import RolesPage from "../pages/RolesPage";
import RoleEmployeesPage from "../pages/RoleEmployeesPage";

interface UserPageProps {
  name: string;
  superAdmin: boolean;
  canAccessEmployees: boolean;
}

export default function UserPage({ superAdmin, canAccessEmployees }: UserPageProps) {
  const withAdminGuard = (element: ReactElement) =>
    superAdmin ? element : <Navigate to="/" replace />;
  const withEmployeeGuard = (element: ReactElement) =>
    canAccessEmployees ? element : <Navigate to="/" replace />;

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/employees" element={withEmployeeGuard(<EmployeesPage />)} />
        <Route path="/employees/register-employees" element={withAdminGuard(<RegisterEmployeesPage />)} />
        <Route path="/employees/update-employees/:employeeCode" element={withAdminGuard(<UpdateEmployeesPage />)} />
        <Route path="/employees/increament-history/:employeeCode" element={withAdminGuard(<IncreamentHistoryPage />)} />
        <Route path="/finance" element={withAdminGuard(<FinancePage />)} />
        <Route path="/finance/new-finance" element={withAdminGuard(<NewFinancePage />)} />
        <Route path="/finance/update-finance/:financeId" element={withAdminGuard(<UpdateFinancePage />)} />
        <Route path="/finance/category-lists" element={withAdminGuard(<CategoryListsPage />)} />
        <Route path="/finance/category-lists/new-category" element={withAdminGuard(<NewCategoryPage />)} />
        <Route path="/finance/category-lists/update-category/:categoryId" element={withAdminGuard(<UpdateCategoryPage />)} />
        <Route path="/finance/bank-accounts" element={withAdminGuard(<BankAccountsPage />)} />
        <Route path="/inventory" element={withAdminGuard(<InventoryBodyPage />)} />
        <Route path="/inventory/categories" element={withAdminGuard(<InventoryCategoriesPage />)} />
        <Route path="/inventory/new-category" element={withAdminGuard(<NewInventoryCategoryPage />)} />
        <Route path="/inventory/update-category/:categoryId" element={withAdminGuard(<UpdateInventoryCategoryPage />)} />
        <Route path="/inventory/items" element={withAdminGuard(<InventoryItemsPage />)} />
        <Route path="/inventory/new-items" element={withAdminGuard(<NewInventoryItemsPage />)} />
        <Route path="/inventory/update-items/:itemId" element={withAdminGuard(<UpdateInventoryItemPage />)} />
        <Route path="/teams" element={withAdminGuard(<TeamPage />)} />
        <Route path="/teams/new-team" element={withAdminGuard(<NewTeamPage />)} />
        <Route path="/teams/update-team/:teamId" element={withAdminGuard(<UpdateTeamsPage />)} />
        <Route path="/teams/:teamId/members" element={withAdminGuard(<TeamMembersPage />)} />
        <Route path="/attendance" element={withAdminGuard(<AttendancePage />)} />
        <Route path="/roles" element={withAdminGuard(<RolesPage />)} />
        <Route path="/roles/employees" element={withAdminGuard(<RoleEmployeesPage />)} />
        <Route path="/settings" element={withAdminGuard(<Setting />)} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
