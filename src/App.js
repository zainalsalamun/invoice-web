import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoiceViewer from "./pages/InvoiceViewer";
import CustomerPage from "./pages/CustomerPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage"; 
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["admin", "kasir", "teknisi"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/new"
        element={
          <ProtectedRoute allowedRoles={["admin", "kasir"]}>
            <CreateInvoicePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/:invoiceId.pdf"
        element={
          <ProtectedRoute allowedRoles={["admin", "kasir", "teknisi"]}>
            <InvoiceViewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["admin", "teknisi"]}>
            <CustomerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["admin", "kasir", "teknisi"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
