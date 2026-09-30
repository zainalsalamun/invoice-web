import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AccountBalanceWalletOutlined,
  AssessmentOutlined,
  BuildOutlined,
  ChevronLeft,
  DarkModeOutlined,
  DashboardOutlined,
  DevicesOutlined,
  Inventory2Outlined,
  LightModeOutlined,
  LogoutOutlined,
  ManageAccountsOutlined,
  Menu as MenuIcon,
  PeopleAltOutlined,
  ReceiptLongOutlined,
  SettingsOutlined,
  SupportAgentOutlined,
  WifiOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Chip,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { authService } from "../services/authService";
import { useThemeMode } from "../context/ThemeModeContext";
import logoRingnet from "../assets/logoringnet.png";

const drawerWidth = 264;
const allRoles = ["super_admin", "admin", "admin_junior", "kasir", "teknisi", "programmer", "management"];

const mainMenu = [
  { label: "Dashboard", icon: DashboardOutlined, path: "/", roles: allRoles },
  { label: "Pelanggan", icon: PeopleAltOutlined, path: "/customers", roles: ["super_admin", "admin", "admin_junior", "teknisi", "management"] },
  { label: "Paket & Layanan", icon: WifiOutlined, path: "/plans", roles: allRoles },
  { label: "Invoice & Pembayaran", icon: ReceiptLongOutlined, path: "/invoices", roles: allRoles },
  { label: "Pekerjaan", icon: BuildOutlined, path: "/chat-tracking", roles: allRoles },
  { label: "Alat Pelanggan", icon: Inventory2Outlined, path: "/assets", roles: ["super_admin", "admin", "admin_junior", "teknisi", "management"] },
  { label: "Request Sistem", icon: SupportAgentOutlined, path: "/system-requests", roles: allRoles },
  { label: "Laporan", icon: AssessmentOutlined, path: "/reports", roles: ["super_admin", "admin", "admin_junior", "kasir", "management"] },
  { label: "Pengaturan", icon: SettingsOutlined, path: "/settings", roles: ["super_admin", "admin", "admin_junior", "kasir", "teknisi", "programmer", "management"] },
];

const utilityMenu = [
  { label: "Keuangan", icon: AccountBalanceWalletOutlined, path: "/keuangan", roles: ["super_admin", "admin", "admin_junior", "kasir", "management"] },
  { label: "Metode Bayar", icon: DevicesOutlined, path: "/metode-pembayaran", roles: ["super_admin", "admin", "admin_junior"] },
  { label: "Pengguna", icon: ManageAccountsOutlined, path: "/users", roles: ["super_admin"] },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const desktop = useMediaQuery(muiTheme.breakpoints.up("md"));
  const { mode, toggleMode } = useThemeMode();
  const darkMode = mode === "dark";
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = authService.getCurrentUser();

  const isActive = (path) => path === "/"
    ? location.pathname === "/"
    : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const go = (path) => {
    navigate(path);
    setMobileOpen(false);
  };

  const logout = () => {
    authService.logout();
    navigate("/login");
  };

  const renderMenu = (items) => (
    <List dense sx={{ px: 1.5, py: 0.5 }}>
      {items
        .filter((item) => item.roles.includes(user?.role))
        .map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <ListItemButton
              key={item.path}
              onClick={() => go(item.path)}
              selected={active}
              sx={{
                borderRadius: 2.5,
                mb: 0.35,
                py: 0.85,
                color: active ? "#fff" : darkMode ? "#cbd0df" : "rgba(255,255,255,.78)",
                "&.Mui-selected": { bgcolor: darkMode ? "rgba(112, 92, 255, .28)" : "rgba(255,255,255,.16)" },
                "&.Mui-selected:hover": { bgcolor: darkMode ? "rgba(112, 92, 255, .34)" : "rgba(255,255,255,.2)" },
                "&:hover": { bgcolor: darkMode ? "rgba(255,255,255,.07)" : "rgba(255,255,255,.12)" },
              }}
            >
              <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}><Icon fontSize="small" /></ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 500 }} />
            </ListItemButton>
          );
        })}
    </List>
  );

  const content = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", color: "#fff" }}>
      <Stack alignItems="center" sx={{ px: 2, py: 1.5, position: "relative" }}>
        <Box
          component="img"
          src={logoRingnet}
          alt="RingNet Internet Service Provider"
          sx={{
            display: "block",
            width: 168,
            maxWidth: "100%",
            height: "auto",
            bgcolor: "#fff",
            borderRadius: 2.5,
            p: 0.75,
            boxShadow: darkMode
              ? "0 8px 24px rgba(0,0,0,.32)"
              : "0 8px 22px rgba(28,20,92,.2)",
          }}
        />
        <Typography
          variant="caption"
          sx={{ mt: 0.5, color: darkMode ? "#9298aa" : "rgba(255,255,255,.68)", letterSpacing: 0.4 }}
        >
          Operations Portal
        </Typography>
        {!desktop && (
          <IconButton
            size="small"
            aria-label="Tutup menu"
            onClick={() => setMobileOpen(false)}
            sx={{ color: "#fff", position: "absolute", top: 8, right: 8, bgcolor: "rgba(0,0,0,.22)", "&:hover": { bgcolor: "rgba(0,0,0,.32)" } }}
          >
            <ChevronLeft />
          </IconButton>
        )}
      </Stack>

      <Divider sx={{ borderColor: "rgba(255,255,255,.1)" }} />
      <Box sx={{ overflowY: "auto", flex: 1, py: 1 }}>
        {renderMenu(mainMenu)}
        <Typography variant="overline" sx={{ display: "block", px: 3, pt: 1.5, color: darkMode ? "#747b90" : "rgba(255,255,255,.45)", fontSize: 10 }}>Administrasi</Typography>
        {renderMenu(utilityMenu)}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,.1)" }} />
      <Stack direction="row" alignItems="center" spacing={1.2} sx={{ p: 1.75 }}>
        <Avatar sx={{ width: 34, height: 34, bgcolor: "rgba(255,255,255,.18)", fontSize: 14 }}>
          {(user?.username || "U").slice(0, 1).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="body2" noWrap fontWeight={650}>{user?.username || "Pengguna"}</Typography>
          <Chip
            size="small"
            label={(user?.role || "guest").replaceAll("_", " ")}
            sx={{ height: 18, bgcolor: "rgba(255,255,255,.12)", color: "rgba(255,255,255,.75)", fontSize: 9 }}
          />
        </Box>
        <Tooltip title={mode === "light" ? "Gunakan mode gelap" : "Gunakan mode terang"}>
          <IconButton size="small" onClick={toggleMode} sx={{ color: "#fff" }}>
            {mode === "light" ? <DarkModeOutlined fontSize="small" /> : <LightModeOutlined fontSize="small" />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Keluar"><IconButton size="small" onClick={logout} sx={{ color: "#fff" }}><LogoutOutlined fontSize="small" /></IconButton></Tooltip>
      </Stack>
    </Box>
  );

  return (
    <>
      {!desktop && (
        <IconButton
          aria-label="Buka menu"
          onClick={() => setMobileOpen(true)}
          sx={{ position: "fixed", zIndex: 1300, bottom: 20, right: 20, color: "#fff", bgcolor: "#5b4be8", boxShadow: 4, "&:hover": { bgcolor: "#4939d2" } }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={desktop ? "permanent" : "temporary"}
        open={desktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            border: 0,
            borderRight: darkMode ? "1px solid #272b38" : 0,
            background: darkMode
              ? "linear-gradient(180deg, #181b25 0%, #12151e 55%, #0d0f16 100%)"
              : "linear-gradient(180deg, #5f4bea 0%, #4432bd 55%, #2c237f 100%)",
          },
        }}
      >
        {content}
      </Drawer>
    </>
  );
};

export default Sidebar;
