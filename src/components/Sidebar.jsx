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

import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Dashboard,
  ReceiptLong,
  People,
  Settings,
  Group,
} from "@mui/icons-material";
import { authService } from "../services/authService";

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const isActive = (path) =>
    location.pathname === path || (active && active === path);

  const roleColors = {
    admin: "#FF5252",
    kasir: "#4CAF50",
    teknisi: "#2196F3",
  };

  // 🔹 Menu yang muncul sesuai role
  const menuByRole = {
    admin: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      { label: "Invoices", icon: <ReceiptLong />, path: "/invoices/new" },
      { label: "Customers", icon: <Group />, path: "/customers" },
      { label: "Users", icon: <People />, path: "/users" },
      { label: "Settings", icon: <Settings />, path: "/settings" },
    ],
    kasir: [
      { label: "Dashboard", icon: <Dashboard />, path: "/" },
      { label: "Invoices", icon: <ReceiptLong />, path: "/invoices/new" },
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
        background: "linear-gradient(180deg, #4facfe 0%, #0052d4 100%)",
        color: "#fff",
        padding: "24px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "3px 0 10px rgba(0,0,0,0.15)",
        minHeight: "100vh",
      }}
    >
      {/* 🔹 Logo & User Info */}
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

        {/* 🔸 Info User */}
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
            {user?.role || "Guest"}
          </span>
        </div>
      </div>

      {/* 🔹 Navigation Menu */}
      <div style={{ flexGrow: 1, width: "100%" }}>
        {menu.map((item, i) => (
          <div
            key={i}
            onClick={() => navigate(item.path)}
            style={{
              width: "100%",
              padding: "12px 28px",
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: isActive(item.path)
                ? "rgba(255, 255, 255, 0.25)"
                : "transparent",
              cursor: "pointer",
              transition: "0.3s",
              color: isActive(item.path)
                ? "#fff"
                : "rgba(255,255,255,0.85)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                "rgba(255,255,255,0.15)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = isActive(item.path)
                ? "rgba(255, 255, 255, 0.25)"
                : "transparent")
            }
          >
            {item.icon}
            <span style={{ fontWeight: 500 }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
