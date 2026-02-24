// import React from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Dashboard,
//   ReceiptLong,
//   People,
//   Settings,
// } from "@mui/icons-material";
// import { authService } from "../services/authService";

// const Sidebar = ({ active }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const user = authService.getCurrentUser();

//   const isActive = (path) =>
//     location.pathname === path || (active && active === path);

//   const roleColors = {
//     admin: "#FF5252",
//     kasir: "#4CAF50",
//     teknisi: "#2196F3",
//   };

//   const menu = [
//     { label: "Dashboard", icon: <Dashboard />, path: "/" },
//     { label: "Invoices", icon: <ReceiptLong />, path: "/invoices/new" },
//     { label: "Customers", icon: <People />, path: "/customers" },
//     { label: "Users", icon: <People />, path: "/users", roles: ["admin"] },
//     { label: "Settings", icon: <Settings />, path: "/settings" },
//   ];

//   return (
//     <div
//       style={{
//         width: 240,
//         background: "linear-gradient(180deg, #4facfe 0%, #0052d4 100%)",
//         color: "#fff",
//         padding: "24px 0",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         boxShadow: "3px 0 10px rgba(0,0,0,0.15)",
//         minHeight: "100vh",
//       }}
//     >
//       {/* 🔹 Logo & User Info */}
//       <div
//         style={{
//           textAlign: "center",
//           width: "100%",
//           marginBottom: 28,
//         }}
//       >
//         <img
//           src={require("../assets/logoringnet.png")}
//           alt="Ringnet"
//           style={{
//             width: 90,
//             marginBottom: 10,
//             background: "#fff",
//             padding: 8,
//             borderRadius: 12,
//             boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
//           }}
//         />
//         <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
//           Ringnet Admin
//         </h3>

//         {/* 🔸 Info User */}
//         <div style={{ marginTop: 12 }}>
//           <p
//             style={{
//               margin: 0,
//               fontWeight: "bold",
//               fontSize: 14,
//               color: "#fff",
//             }}
//           >
//             {user?.username || "-"}
//           </p>
//           <span
//             style={{
//               fontSize: 12,
//               fontWeight: 500,
//               backgroundColor: roleColors[user?.role] || "#999",
//               padding: "4px 10px",
//               borderRadius: 20,
//               color: "#fff",
//               textTransform: "capitalize",
//             }}
//           >
//             {user?.role || "Guest"}
//           </span>
//         </div>
//       </div>

//       {/* 🔹 Navigation Menu */}
//       <div style={{ flexGrow: 1, width: "100%" }}>
//         {menu
//           .filter((item) => !item.roles || item.roles.includes(user?.role))
//           .map((item, i) => (
//             <div
//               key={i}
//               onClick={() => navigate(item.path)}
//               style={{
//                 width: "100%",
//                 padding: "12px 28px",
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 12,
//                 backgroundColor: isActive(item.path)
//                   ? "rgba(255, 255, 255, 0.25)"
//                   : "transparent",
//                 cursor: "pointer",
//                 transition: "0.3s",
//                 color: isActive(item.path)
//                   ? "#fff"
//                   : "rgba(255,255,255,0.85)",
//               }}
//               onMouseEnter={(e) =>
//                 (e.currentTarget.style.backgroundColor =
//                   "rgba(255,255,255,0.15)")
//               }
//               onMouseLeave={(e) =>
//                 (e.currentTarget.style.backgroundColor = isActive(item.path)
//                   ? "rgba(255, 255, 255, 0.25)"
//                   : "transparent")
//               }
//             >
//               {item.icon}
//               <span style={{ fontWeight: 500 }}>{item.label}</span>
//             </div>
//           ))}
//       </div>
//     </div>
//   );
// };

// export default Sidebar;

import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dashboard,
  ReceiptLong,
  People,
  Settings,
  Group,
  CreditCard,
  AccountBalanceWallet,
  Chat,
  ExpandMore,
  ExpandLess,
} from "@mui/icons-material";
import { Collapse } from "@mui/material";
import { authService } from "../services/authService";

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [openInvoices, setOpenInvoices] = useState(
    location.pathname.startsWith("/invoices") || (active && active.startsWith("/invoices"))
  );

  const isActive = (path) =>
    location.pathname === path || (active && active === path);

  const roleColors = {
    super_admin: "#7c3aed",
    admin: "#FF5252",
    admin_junior: "#f59e0b",
    kasir: "#4CAF50",
    teknisi: "#2196F3",
  };

  const roleLabels = {
    super_admin: "Super Admin",
    admin: "Admin",
    admin_junior: "Admin Junior",
    kasir: "Kasir",
    teknisi: "Teknisi",
  };

  const menuByRole = {
    super_admin: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      {
        label: "Invoices",
        icon: <ReceiptLong />,
        path: "/invoices", // Parent path
        children: [
          { label: "Daftar Invoice", path: "/invoices" },
          { label: "Buat Invoice", path: "/invoices/new" },
        ],
      },
      { label: "Customers", icon: <Group />, path: "/customers" },
      { label: "Metode Pembayaran", icon: <CreditCard />, path: "/metode-pembayaran" },
      { label: "Keuangan", icon: <AccountBalanceWallet />, path: "/keuangan" },
      { label: "Chat Tracking", icon: <Chat />, path: "/chat-tracking" },
      { label: "Users", icon: <People />, path: "/users" },
      { label: "Settings", icon: <Settings />, path: "/settings" },
    ],
    admin: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      {
        label: "Invoices",
        icon: <ReceiptLong />,
        path: "/invoices",
        children: [
          { label: "Daftar Invoice", path: "/invoices" },
          { label: "Buat Invoice", path: "/invoices/new" },
        ],
      },
      { label: "Customers", icon: <Group />, path: "/customers" },
      { label: "Metode Pembayaran", icon: <CreditCard />, path: "/metode-pembayaran" },
      { label: "Keuangan", icon: <AccountBalanceWallet />, path: "/keuangan" },
      { label: "Chat Tracking", icon: <Chat />, path: "/chat-tracking" },
      { label: "Settings", icon: <Settings />, path: "/settings" },
    ],
    admin_junior: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      {
        label: "Invoices",
        icon: <ReceiptLong />,
        path: "/invoices",
        children: [
          { label: "Daftar Invoice", path: "/invoices" },
          { label: "Buat Invoice", path: "/invoices/new" },
        ],
      },
      { label: "Customers", icon: <Group />, path: "/customers" },
      { label: "Metode Pembayaran", icon: <CreditCard />, path: "/metode-pembayaran" },
      { label: "Keuangan", icon: <AccountBalanceWallet />, path: "/keuangan" },
      { label: "Chat Tracking", icon: <Chat />, path: "/chat-tracking" },
    ],
    kasir: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      {
        label: "Invoices",
        icon: <ReceiptLong />,
        path: "/invoices",
        children: [
          { label: "Daftar Invoice", path: "/invoices" },
          { label: "Buat Invoice", path: "/invoices/new" },
        ],
      },
      { label: "Keuangan", icon: <AccountBalanceWallet />, path: "/keuangan" },
      { label: "Settings", icon: <Settings />, path: "/settings" },
    ],
    teknisi: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      { label: "Customers", icon: <Group />, path: "/customers" },
      { label: "Settings", icon: <Settings />, path: "/settings" },
    ],
  };

  const menu = menuByRole[user?.role] || [];

  return (
    <div
      style={{
        width: 240,
        minWidth: 240,
        background: "linear-gradient(180deg, #4facfe 0%, #0052d4 100%)",
        color: "#fff",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "3px 0 10px rgba(0,0,0,0.15)",
        height: "100vh",
        position: "sticky",
        top: 0,
        overflowY: "auto",
        boxSizing: "border-box"
      }}
    >
      <div
        style={{
          textAlign: "center",
          width: "100%",
          marginBottom: 28,
        }}
      >
        <img
          src={require("../assets/logoringnet.png")}
          alt="Ringnet"
          style={{
            width: 90,
            marginBottom: 10,
            background: "#fff",
            padding: 8,
            borderRadius: 12,
            boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
          }}
        />
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
          Ringnet Admin
        </h3>

        <div style={{ marginTop: 12 }}>
          <p
            style={{
              margin: 0,
              fontWeight: "bold",
              fontSize: 14,
              color: "#fff",
            }}
          >
            {user?.username || "-"}
          </p>
          <span
            style={{
              fontSize: 12,
              fontWeight: 500,
              backgroundColor: roleColors[user?.role] || "#999",
              padding: "4px 10px",
              borderRadius: 20,
              color: "#fff",
              textTransform: "capitalize",
            }}
          >
            {roleLabels[user?.role] || user?.role || "Guest"}
          </span>
        </div>
      </div>

      <div style={{ flexGrow: 1, width: "100%" }}>
        {menu.map((item, i) => {
          const hasChildren = item.children && item.children.length > 0;
          const isParentActive = hasChildren && (location.pathname.startsWith(item.path) || (active && active.startsWith(item.path)));

          return (
            <div key={i}>
              <div
                onClick={() => {
                  if (hasChildren) {
                    setOpenInvoices(!openInvoices);
                  } else {
                    navigate(item.path);
                  }
                }}
                style={{
                  width: "100%",
                  padding: "12px 28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: !hasChildren && isActive(item.path)
                    ? "rgba(255, 255, 255, 0.25)"
                    : "transparent",
                  cursor: "pointer",
                  transition: "0.3s",
                  color: (!hasChildren && isActive(item.path)) || (hasChildren && isParentActive)
                    ? "#fff"
                    : "rgba(255,255,255,0.85)",
                  boxSizing: "border-box"
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
                }
                onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = !hasChildren && isActive(item.path)
                  ? "rgba(255, 255, 255, 0.25)"
                  : "transparent")
                }
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {item.icon}
                  <span style={{ fontWeight: 500 }}>{item.label}</span>
                </div>
                {hasChildren && (openInvoices ? <ExpandLess size={18} /> : <ExpandMore size={18} />)}
              </div>

              {hasChildren && (
                <Collapse in={openInvoices} timeout="auto" unmountOnExit>
                  <div style={{ backgroundColor: "rgba(0,0,0,0.1)", paddingBottom: 8 }}>
                    {item.children.map((child, ci) => (
                      <div
                        key={ci}
                        onClick={() => navigate(child.path)}
                        style={{
                          padding: "10px 28px 10px 64px",
                          cursor: "pointer",
                          fontSize: 14,
                          color: isActive(child.path) ? "#fff" : "rgba(255,255,255,0.7)",
                          backgroundColor: isActive(child.path) ? "rgba(255,255,255,0.1)" : "transparent",
                          transition: "0.2s"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#fff"}
                        onMouseLeave={(e) => e.currentTarget.style.color = isActive(child.path) ? "#fff" : "rgba(255,255,255,0.7)"}
                      >
                        {child.label}
                      </div>
                    ))}
                  </div>
                </Collapse>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
