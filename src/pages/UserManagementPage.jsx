import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TableContainer,
  Paper,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  CircularProgress,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:2002/api";

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openPasswordDialog, setOpenPasswordDialog] = useState(false); // ✅ Dialog ubah password
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ username: "", password: "", role: "kasir" });
  const [passwordForm, setPasswordForm] = useState({ new_password: "" }); // ✅ form ganti password
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  // 🔹 Ambil data user
  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`, { headers });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error("Gagal ambil data user:", err);
      setSnackbar({ open: true, message: "Gagal memuat data user", severity: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
  }, );

  // 🔹 Tambah user
  const handleSubmit = async () => {
    if (!form.username.trim() || !form.password.trim()) {
      return setSnackbar({
        open: true,
        message: "Lengkapi semua field sebelum simpan",
        severity: "warning",
      });
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/users`, form, { headers });
      setOpenDialog(false);
      setForm({ username: "", password: "", role: "kasir" });
      fetchUsers();
      setSnackbar({ open: true, message: "User berhasil ditambahkan", severity: "success" });
    } catch (err) {
      console.error("Gagal tambah user:", err);
      setSnackbar({ open: true, message: "Gagal menambah user", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Hapus user
  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await axios.delete(`${BASE_URL}/users/${id}`, { headers });
      fetchUsers();
      setSnackbar({ open: true, message: "User berhasil dihapus", severity: "success" });
    } catch (err) {
      console.error("Gagal hapus user:", err);
      setSnackbar({ open: true, message: "Gagal menghapus user", severity: "error" });
    }
  };

  // 🔹 Buka dialog ganti password
  const openChangePassword = (user) => {
    setSelectedUser(user);
    setPasswordForm({ new_password: "" });
    setOpenPasswordDialog(true);
  };

  // 🔹 Submit ganti password
  const handleChangePassword = async () => {
    if (!passwordForm.new_password.trim()) {
      return setSnackbar({
        open: true,
        message: "Password baru tidak boleh kosong",
        severity: "warning",
      });
    }

    setLoading(true);
    try {
      await axios.put(
        `${BASE_URL}/users/${selectedUser.id}/password`,
        { new_password: passwordForm.new_password },
        { headers }
      );
      setOpenPasswordDialog(false);
      setSnackbar({ open: true, message: "Password berhasil diubah", severity: "success" });
    } catch (err) {
      console.error("Gagal ubah password:", err);
      setSnackbar({ open: true, message: "Gagal mengubah password", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="users" />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          👥 Manajemen User
        </Typography>

        <Card sx={{ mb: 3, borderRadius: 2, boxShadow: 2 }}>
          <CardContent
            sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
          >
            <Typography variant="body1">
              Kelola akun <b>Admin</b>, <b>Kasir</b>, dan <b>Teknisi</b> untuk sistem Ringnet
            </Typography>
            <Button
              variant="contained"
              sx={{
                background: "linear-gradient(90deg, #007bff, #0052d4)",
                textTransform: "none",
                fontWeight: 600,
                px: 3,
              }}
              onClick={() => setOpenDialog(true)}
            >
              + Tambah User
            </Button>
          </CardContent>
        </Card>

        {/* 🔹 Table User */}
        <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 2 }}>
          <Table>
            <TableHead sx={{ backgroundColor: "#f4f6f8" }}>
              <TableRow>
                <TableCell><b>Username</b></TableCell>
                <TableCell><b>Role</b></TableCell>
                <TableCell><b>Dibuat</b></TableCell>
                <TableCell align="center"><b>Aksi</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.username}</TableCell>
                  <TableCell>
                    {u.role === "admin" ? "👑 Admin" :
                     u.role === "kasir" ? "💰 Kasir" :
                     "🧰 Teknisi"}
                  </TableCell>
                  <TableCell>
                    {u.created_at
                      ? new Date(u.created_at).toLocaleString("id-ID")
                      : "-"}
                  </TableCell>
                  <TableCell align="center">
                    <Button
                      size="small"
                      color="primary"
                      variant="outlined"
                      sx={{ mr: 1 }}
                      onClick={() => openChangePassword(u)}
                    >
                      Ganti Password
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => handleDelete(u.id)}
                    >
                      Hapus
                    </Button>
                  </TableCell>
                </TableRow>
              ))}

              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    Belum ada user terdaftar.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* 🔹 Dialog Tambah User */}
        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Tambah User Baru</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              mt: 1,
              minWidth: 320,
            }}
          >
            <TextField
              label="Username"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              fullWidth
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              fullWidth
            />
            <TextField
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              fullWidth
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="kasir">Kasir</MenuItem>
              <MenuItem value="teknisi">Teknisi</MenuItem>
            </TextField>
          </DialogContent>

          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(90deg, #007bff, #0052d4)",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Simpan"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 🔹 Dialog Ganti Password */}
        <Dialog open={openPasswordDialog} onClose={() => setOpenPasswordDialog(false)}>
          <DialogTitle>Ganti Password User</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Ganti password untuk user: <b>{selectedUser?.username}</b>
            </Typography>
            <TextField
              label="Password Baru"
              type="password"
              value={passwordForm.new_password}
              onChange={(e) => setPasswordForm({ new_password: e.target.value })}
              fullWidth
            />
          </DialogContent>
          <DialogActions sx={{ pr: 3, pb: 2 }}>
            <Button onClick={() => setOpenPasswordDialog(false)}>Batal</Button>
            <Button
              onClick={handleChangePassword}
              variant="contained"
              disabled={loading}
              sx={{
                background: "linear-gradient(90deg, #007bff, #0052d4)",
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Simpan"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* 🔹 Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default UserManagementPage;
