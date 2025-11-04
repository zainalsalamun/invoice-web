import React from "react";
import { Drawer, List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import SettingsIcon from "@mui/icons-material/Settings";
import logoRingnet from "../assets/logoringnet.png";

const Sidebar = ({ active = "dashboard" }) => {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <DashboardIcon /> },
    { id: "invoices", label: "Invoices", icon: <ReceiptIcon /> },
    { id: "settings", label: "Settings", icon: <SettingsIcon /> },
  ];

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 230,
        "& .MuiDrawer-paper": {
          width: 230,
          boxSizing: "border-box",
          background: "linear-gradient(180deg, #007bff 0%, #0056b3 100%)",
          color: "white",
        },
      }}
    >
      <div style={{ textAlign: "center", padding: "25px 10px" }}>
        <img
          src={logoRingnet}
          alt="Ringnet"
          style={{
            width: 70,
            height: 70,
            borderRadius: 8,
            background: "white",
            padding: 4,
          }}
        />
        <h3 style={{ margin: "10px 0 0", fontSize: 16 }}>Ringnet Admin</h3>
      </div>

      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.id}
            sx={{
              backgroundColor: active === item.id ? "rgba(255,255,255,0.2)" : "transparent",
              transition: "0.3s",
              "&:hover": { backgroundColor: "rgba(255,255,255,0.15)" },
            }}
          >
            <ListItemIcon sx={{ color: "white", minWidth: 40 }}>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
