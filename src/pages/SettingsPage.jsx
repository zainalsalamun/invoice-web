import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Button,
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Chip,
  Divider,
} from "@mui/material";
import { Person, ExitToApp, SettingsOutlined } from "@mui/icons-material";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [openLogout, setOpenLogout] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const getRoleLabel = (role) => {
    const roles = {
      super_admin: "SUPER ADMIN",
      admin: "ADMIN",
      admin_junior: "ADMIN JUNIOR",
      kasir: "KASIR",
      teknisi: "TEKNISI",
    };
    return roles[role] || role?.toUpperCase() || "USER";
  };

  const getRoleDescription = (role) => {
    const descriptions = {
      super_admin: "Akses Tingkat Super Admin Perusahaan",
      admin: "Akses Manajemen Data & Operasional",
      admin_junior: "Akses Operasional Terbatas",
      kasir: "Akses Sistem Kasir & Keuangan",
      teknisi: "Akses Manajemen Pelanggan & Teknis",
    };
    return descriptions[role] || "Akses Pengguna Standar";
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar active="/settings" />

      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 2, md: 4 },
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          minWidth: 0,
          overflowX: "hidden",
        }}
      >
        {/* Header Section */}
        <Box sx={{ width: "100%", maxWidth: 600, mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1, color: "text.primary", fontSize: "1.1rem" }}>
            <SettingsOutlined aria-hidden="true" /> Pengaturan Akun
          </Typography>
        </Box>

        {/* Main Card */}
        <Paper
          sx={{
            width: "100%",
            maxWidth: 600,
            borderRadius: 3,
            boxShadow: (theme) => theme.palette.mode === "dark" ? "0 16px 36px rgba(0,0,0,.28)" : "0 10px 25px rgba(0,0,0,0.05)",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            p: { xs: 2, md: 4 },
            textAlign: "center",
          }}
        >
          {/* Profile Header */}
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: "#7c3aed",
                mb: 1,
                boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
              }}
            >
              <Person sx={{ fontSize: 35 }} />
            </Avatar>

            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
              {user?.username || "Username"}
            </Typography>
            <Chip
              label={getRoleLabel(user?.role)}
              sx={{
                bgcolor: (theme) => theme.palette.mode === "dark" ? "rgba(128,114,255,.18)" : "#f3e8ff",
                color: (theme) => theme.palette.mode === "dark" ? "#a99fff" : "#7c3aed",
                fontWeight: "bold",
                fontSize: "0.65rem",
                px: 0.5,
                height: 20,
                mt: 0.5
              }}
            />
          </Box>

          <Divider sx={{ width: "100%", mb: 3 }} />

          {/* Information Sections */}
          <Box sx={{ width: "100%", mb: 3 }}>
            <Box sx={{ mb: 2.5 }}>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                IDENTITAS LOGIN
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", mt: 0.5, fontWeight: 500 }}>
                {user?.username}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>
                HAK AKSES SISTEM
              </Typography>
              <Typography variant="body2" sx={{ color: "text.primary", mt: 0.5, fontWeight: 500 }}>
                {getRoleDescription(user?.role)}
              </Typography>
            </Box>
          </Box>

          {/* Logout Button */}
          <Button
            variant="contained"
            onClick={() => setOpenLogout(true)}
            startIcon={<ExitToApp sx={{ fontSize: "1.1rem !important" }} />}
            sx={{
              bgcolor: "#dc2626",
              "&:hover": { bgcolor: "#b91c1c" },
              py: 1,
              px: 3,
              borderRadius: 2,
              fontSize: "0.85rem",
              fontWeight: "bold",
              textTransform: "none",
              boxShadow: "0 4px 12px rgba(220, 38, 38, 0.2)",
              alignSelf: "center"
            }}
          >
            Keluar dari Sistem
          </Button>
        </Paper>

        {/* Footer Version */}
        <Typography variant="body2" sx={{ mt: 4, color: "text.secondary", textAlign: "center" }}>
          Versi Aplikasi: 2.1.0-stable | Ringnet Customer Management
        </Typography>
      </Box>

      {/* Logout Confirmation Dialog */}
      <Dialog
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: "bold" }}>Konfirmasi Logout</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Apakah Anda yakin ingin keluar dari sistem Ringnet?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => setOpenLogout(false)} color="inherit" sx={{ fontWeight: "bold" }}>
            Batal
          </Button>
          <Button
            onClick={handleLogout}
            variant="contained"
            color="error"
            sx={{ borderRadius: 2, fontWeight: "bold", px: 3 }}
          >
            Ya, Keluar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
