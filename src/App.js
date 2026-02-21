import React from "react";
import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoiceViewer from "./pages/InvoiceViewer";
import CustomerPage from "./pages/CustomerPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage";
import MetodePembayaranPage from "./pages/MetodePembayaranPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoiceProofPage from "./pages/InvoiceProofPage";
import KeuanganPage from "./pages/KeuanganPage";
import ChatTrackingPage from "./pages/ChatTrackingPage";

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "kasir", "teknisi"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/new"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "kasir"]}>
            <CreateInvoicePage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/invoices/:invoiceId.pdf"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "kasir", "teknisi"]}>
            <InvoiceViewer />
          </ProtectedRoute>
        }
      />

      <Route
        path="/customers"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "teknisi"]}>
            <CustomerPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <UserManagementPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "kasir", "teknisi"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/metode-pembayaran"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <MetodePembayaranPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat-tracking"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin"]}>
            <ChatTrackingPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFoundPage />} />

      <Route
        path="/invoices/detail/:id"
        element={
          <ProtectedRoute allowedRoles={["admin", "kasir"]}>
            <InvoiceDetailPage />
          </ProtectedRoute>
        }
      />

      <Route path="/invoices/:id/proof" element={<InvoiceProofPage />} />

      <Route
        path="/keuangan"
        element={
          <ProtectedRoute allowedRoles={["super_admin", "admin", "kasir"]}>
            <KeuanganPage />
          </ProtectedRoute>
        }
      />


    </Routes>


  );
};

export default App;
