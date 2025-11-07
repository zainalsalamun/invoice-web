// src/components/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Dashboard, ReceiptLong, Settings } from "@mui/icons-material";

const Sidebar = ({ active }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path || (active && active === path);

  const menu = [
    { label: "Dashboard", icon: <Dashboard />, path: "/" },
    { label: "Invoices", icon: <ReceiptLong />, path: "/invoices/new" },
    { label: "Settings", icon: <Settings />, path: "/settings" },
  ];

  return (
    <div
      style={{
        width: 240,
        background: "linear-gradient(180deg, #4facfe 0%, #0052d4 100%)",
        color: "#fff",
        padding: "28px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        boxShadow: "3px 0 10px rgba(0,0,0,0.15)",
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
      <h3
        style={{
          marginBottom: 28,
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: 0.3,
        }}
      >
        Ringnet Admin
      </h3>

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
            color: isActive(item.path) ? "#fff" : "rgba(255,255,255,0.85)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
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
  );
};

export default Sidebar;


// src/components/Sidebar.jsx
// import React, { useEffect, useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Dashboard, ReceiptLong, Settings } from "@mui/icons-material";

// const Sidebar = ({ active }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     // delay biar animasi halus
//     const timer = setTimeout(() => setVisible(true), 50);
//     return () => clearTimeout(timer);
//   }, []);

//   const isActive = (path) =>
//     location.pathname === path || (active && active === path);

//   const menu = [
//     { label: "Dashboard", icon: <Dashboard />, path: "/" },
//     { label: "Invoices", icon: <ReceiptLong />, path: "/invoices/new" },
//     { label: "Settings", icon: <Settings />, path: "/settings" },
//   ];

//   return (
//     <div
//       style={{
//         width: 240,
//         background: "linear-gradient(180deg, #4facfe 0%, #0052d4 100%)",
//         color: "#fff",
//         padding: "28px 0",
//         display: "flex",
//         flexDirection: "column",
//         alignItems: "center",
//         boxShadow: "3px 0 10px rgba(0,0,0,0.15)",
//         transform: visible ? "translateX(0)" : "translateX(-100%)",
//         opacity: visible ? 1 : 0,
//         transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
//       }}
//     >
//       {/* Logo */}
//       <img
//         src={require("../assets/logoringnet.png")}
//         alt="Ringnet Logo"
//         style={{
//           width: 90,
//           marginBottom: 10,
//           background: "#fff",
//           padding: 8,
//           borderRadius: 12,
//           boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
//         }}
//       />
//       <h3
//         style={{
//           marginBottom: 28,
//           fontSize: 16,
//           fontWeight: 600,
//           letterSpacing: 0.3,
//           textShadow: "0 1px 3px rgba(0,0,0,0.3)",
//         }}
//       >
//         Ringnet Admin
//       </h3>

//       {/* Menu List */}
//       {menu.map((item, i) => (
//         <div
//           key={i}
//           onClick={() => navigate(item.path)}
//           style={{
//             width: "100%",
//             padding: "12px 28px",
//             display: "flex",
//             alignItems: "center",
//             gap: 12,
//             cursor: "pointer",
//             transition: "all 0.25s ease",
//             backgroundColor: isActive(item.path)
//               ? "rgba(255, 255, 255, 0.25)"
//               : "transparent",
//             color: isActive(item.path) ? "#fff" : "rgba(255,255,255,0.9)",
//           }}
//           onMouseEnter={(e) =>
//             (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.15)")
//           }
//           onMouseLeave={(e) =>
//             (e.currentTarget.style.backgroundColor = isActive(item.path)
//               ? "rgba(255, 255, 255, 0.25)"
//               : "transparent")
//           }
//         >
//           <span style={{ fontSize: 20 }}>{item.icon}</span>
//           <span
//             style={{
//               fontWeight: 500,
//               fontSize: 15,
//               textShadow: "0 1px 3px rgba(0,0,0,0.2)",
//             }}
//           >
//             {item.label}
//           </span>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default Sidebar;
