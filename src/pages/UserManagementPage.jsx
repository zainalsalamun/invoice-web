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
  const [form, setForm] = useState({ username: "", password: "", role: "kasir" });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users`, { headers });
      setUsers(res.data.data || []);
    } catch (err) {
      console.error(" Gagal ambil data user:", err);
      setSnackbar({ open: true, message: "Gagal memuat data user", severity: "error" });
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

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
      console.error(" Gagal tambah user:", err);
      setSnackbar({ open: true, message: "Gagal menambah user", severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus user ini?")) return;
    try {
      await axios.delete(`${BASE_URL}/users/${id}`, { headers });
      fetchUsers();
      setSnackbar({ open: true, message: "User berhasil dihapus", severity: "success" });
    } catch (err) {
      console.error(" Gagal hapus user:", err);
      setSnackbar({ open: true, message: "Gagal menghapus user", severity: "error" });
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
