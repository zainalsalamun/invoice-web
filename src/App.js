// // import React from "react";
// // import { Routes, Route } from "react-router-dom";

// // import DashboardPage from "./pages/DashboardPage";
// // import CreateInvoicePage from "./pages/CreateInvoicePage";
// // import InvoiceViewer from "./pages/InvoiceViewer";
// // import CustomerPage from "./pages/CustomerPage";
// // import UserManagementPage from "./pages/UserManagementPage";
// // import NotFoundPage from "./pages/NotFoundPage";

// // const App = () => {
// //   return (
// //     <Routes>
// //       <Route path="/" element={<DashboardPage />} />
// //       <Route path="/invoices/new" element={<CreateInvoicePage />} />
// //       <Route path="/invoices/:invoiceId.pdf" element={<InvoiceViewer />} />
// //       <Route path="/customers" element={<CustomerPage />} />
// //       <Route path="/users" element={<UserManagementPage />} />
// //       <Route path="*" element={<NotFoundPage />} />
// //     </Routes>
// //   );
// // };

// // export default App;


// // src/App.js
// import React from "react";
// import { Routes, Route } from "react-router-dom";

// // 🧩 Pages
// import DashboardPage from "./pages/DashboardPage";
// import CreateInvoicePage from "./pages/CreateInvoicePage";
// import InvoiceViewer from "./pages/InvoiceViewer";
// import CustomerPage from "./pages/CustomerPage";
// import UserManagementPage from "./pages/UserManagementPage";
// import NotFoundPage from "./pages/NotFoundPage";
// import LoginPage from "./pages/LoginPage"; // ✅ halaman login

// // 🛡️ Proteksi route
// import ProtectedRoute from "./components/ProtectedRoute";

// const App = () => {
//   return (
//     <Routes>
//       {/* 🔓 Halaman Login */}
//       <Route path="/login" element={<LoginPage />} />

//       {/* 🔒 Dashboard & Pages lainnya */}
//       <Route
//         path="/"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "kasir", "teknisi"]}>
//             <DashboardPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/invoices/new"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "kasir"]}>
//             <CreateInvoicePage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/invoices/:invoiceId.pdf"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "kasir", "teknisi"]}>
//             <InvoiceViewer />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/customers"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "teknisi"]}>
//             <CustomerPage />
//           </ProtectedRoute>
//         }
//       />

//       <Route
//         path="/users"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <UserManagementPage />
//           </ProtectedRoute>
//         }
//       />

//       {/* 🚫 Halaman tidak ditemukan */}
//       <Route path="*" element={<NotFoundPage />} />
//     </Routes>
//   );
// };

// export default App;


// src/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";

// 🧩 Pages
import DashboardPage from "./pages/DashboardPage";
import CreateInvoicePage from "./pages/CreateInvoicePage";
import InvoiceViewer from "./pages/InvoiceViewer";
import CustomerPage from "./pages/CustomerPage";
import UserManagementPage from "./pages/UserManagementPage";
import SettingsPage from "./pages/SettingsPage"; // ✅ ditambahkan
import NotFoundPage from "./pages/NotFoundPage";
import LoginPage from "./pages/LoginPage"; // ✅ halaman login

// 🛡️ Proteksi route
import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {
  return (
    <Routes>
      {/* 🔓 Halaman Login */}
      <Route path="/login" element={<LoginPage />} />

      {/* 🔒 Dashboard & Pages lainnya */}
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

      {/* ⚙️ Settings */}
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["admin", "kasir", "teknisi"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />

      {/* 🚫 Halaman tidak ditemukan */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default App;
