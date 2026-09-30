import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import OperationalDashboardPage from "./pages/OperationalDashboardPage";
import PlansPage from "./pages/PlansPage";
import AssetsPage from "./pages/AssetsPage";
import SystemRequestsPage from "./pages/SystemRequestsPage";
import ReportsPage from "./pages/ReportsPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoiceViewer from "./pages/InvoiceViewer";
import CustomerPage from "./pages/CustomerPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage";
import MetodePembayaranPage from "./pages/MetodePembayaranPage";
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import InvoiceProofPage from "./pages/InvoiceProofPage";
import KeuanganPage from "./pages/KeuanganPage";
import ChatTrackingPage from "./pages/ChatTrackingPage";
import InvoiceListPage from "./pages/InvoiceListPage";

const allRoles = ["super_admin", "admin", "admin_junior", "kasir", "teknisi", "programmer", "management"];
const customerRoles = ["super_admin", "admin", "admin_junior", "teknisi", "management"];
const billingRoles = ["super_admin", "admin", "admin_junior", "kasir", "teknisi", "management"];
const managementRoles = ["super_admin", "admin", "admin_junior", "kasir", "management"];

const secure = (roles, page) => <ProtectedRoute allowedRoles={roles}>{page}</ProtectedRoute>;

const App = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/" element={secure(allRoles, <OperationalDashboardPage />)} />
    <Route path="/customers" element={secure(customerRoles, <CustomerPage />)} />
    <Route path="/plans" element={secure(allRoles, <PlansPage />)} />
    <Route path="/invoices" element={secure(billingRoles, <InvoiceListPage />)} />
    <Route path="/invoices/new" element={secure(["super_admin", "admin", "admin_junior", "kasir"], <CreateInvoicePage />)} />
    <Route path="/invoices/:invoiceId.pdf" element={secure(billingRoles, <InvoiceViewer />)} />
    <Route path="/invoices/detail/:id" element={secure(["super_admin", "admin", "admin_junior", "kasir"], <InvoiceDetailPage />)} />
    <Route path="/invoices/:id/proof" element={secure(billingRoles, <InvoiceProofPage />)} />
    <Route path="/chat-tracking" element={secure(allRoles, <ChatTrackingPage />)} />
    <Route path="/assets" element={secure(customerRoles, <AssetsPage />)} />
    <Route path="/system-requests" element={secure(allRoles, <SystemRequestsPage />)} />
    <Route path="/reports" element={secure(managementRoles, <ReportsPage />)} />
    <Route path="/keuangan" element={secure(managementRoles, <KeuanganPage />)} />
    <Route path="/metode-pembayaran" element={secure(["super_admin", "admin", "admin_junior"], <MetodePembayaranPage />)} />
    <Route path="/users" element={secure(["super_admin"], <UserManagementPage />)} />
    <Route path="/settings" element={secure(allRoles, <SettingsPage />)} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
