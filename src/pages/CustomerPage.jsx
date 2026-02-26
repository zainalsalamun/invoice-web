import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Typography, TextField, MenuItem, Select, InputLabel, FormControl, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import Sidebar from "../components/Sidebar";
import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import { customerService } from "../services/customerService";
import { authService } from "../services/authService";
import { notifySuccess, notifyInfo, notifyError } from "../utils/notify";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error("Gagal ambil data pelanggan:", err);
      const errorMessage = err.response?.data?.message || err.message || "Gagal memuat data pelanggan";
      notifyError(`Error: ${errorMessage}`);
    }
  };

  const [search, setSearch] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterBulan, setFilterBulan] = useState("");

  useEffect(() => {
    fetchData();

    // Refresh data saat tab kembali aktif
    const handleFocus = () => fetchData();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  const filteredCustomers = customers.filter(c => {
    const effectiveStatus = (c.last_invoice_status || c.status_pembayaran || "BELUM LUNAS").toUpperCase();
    const matchSearch = c.nama.toLowerCase().includes(search.toLowerCase()) ||
      (c.id_pelanggan && c.id_pelanggan.toLowerCase().includes(search.toLowerCase()));
    const matchKategori = filterKategori ? c.kategori_pelanggan === filterKategori : true;
    const matchStatus = filterStatus ? effectiveStatus === filterStatus.toUpperCase() : true;
    const matchBulan = filterBulan ? (c.tanggal_jatuh_tempo && new Date(c.tanggal_jatuh_tempo).getMonth() + 1 === parseInt(filterBulan)) : true;
    return matchSearch && matchKategori && matchStatus && matchBulan;
  });

  const uniqueKategori = [...new Set(customers.map(c => c.kategori_pelanggan).filter(Boolean))];

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await customerService.update(editing.id, formData);
        notifySuccess("Pelanggan berhasil diperbarui!");
      } else {
        await customerService.create(formData);
        notifySuccess("🎉 Pelanggan baru berhasil ditambahkan!");
      }
      setShowForm(false);
      setEditing(null);
      fetchData();
    } catch (err) {
      console.error("Error saat menyimpan pelanggan:", err);
      notifyError("Gagal menyimpan data pelanggan");
    }
  };

  const handleDelete = (id) => {
    setCustomerToDelete(id);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        await customerService.remove(customerToDelete);
        notifyInfo("🗑️ Pelanggan berhasil dihapus");
        fetchData();
      } catch (err) {
        console.error("Gagal hapus pelanggan:", err);
        notifyError("Gagal menghapus pelanggan");
      }
      setOpenDeleteDialog(false);
      setCustomerToDelete(null);
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="customers" />

      <Box sx={{ flexGrow: 1, p: 4, minWidth: 0, overflowX: 'hidden' }}>
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          👥 Manajemen Pelanggan
        </Typography>

        {showForm ? (
          <CustomerForm
            onSubmit={handleSave}
            initialData={editing}
            onCancel={() => {
              setShowForm(false);
              setEditing(null);
            }}
          />
        ) : (
          <>
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
              <Button
                variant="contained"
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  borderRadius: 2,
                  boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                  height: 40
                }}
                onClick={() => setShowForm(true)}
              >
                ➕ Tambah Pelanggan
              </Button>

              <TextField
                label="Cari Nama / ID"
                variant="outlined"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: 200 }}
              />

              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel>Kategori</InputLabel>
                <Select
                  value={filterKategori}
                  label="Kategori"
                  onChange={(e) => setFilterKategori(e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  {uniqueKategori.map(k => (
                    <MenuItem key={k} value={k}>{k}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: 200 }}>
                <InputLabel>Status Pembayaran</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status Pembayaran"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="LUNAS">Lunas</MenuItem>
                  <MenuItem value="BELUM LUNAS">Belum Lunas</MenuItem>
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ width: 170 }}>
                <InputLabel>Bulan</InputLabel>
                <Select
                  value={filterBulan}
                  label="Bulan"
                  onChange={(e) => setFilterBulan(e.target.value)}
                >
                  <MenuItem value="">Semua</MenuItem>
                  <MenuItem value="1">Januari</MenuItem>
                  <MenuItem value="2">Februari</MenuItem>
                  <MenuItem value="3">Maret</MenuItem>
                  <MenuItem value="4">April</MenuItem>
                  <MenuItem value="5">Mei</MenuItem>
                  <MenuItem value="6">Juni</MenuItem>
                  <MenuItem value="7">Juli</MenuItem>
                  <MenuItem value="8">Agustus</MenuItem>
                  <MenuItem value="9">September</MenuItem>
                  <MenuItem value="10">Oktober</MenuItem>
                  <MenuItem value="11">November</MenuItem>
                  <MenuItem value="12">Desember</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <CustomerTable
              data={filteredCustomers}
              userRole={user?.role}
              onEdit={(row) => {
                setEditing(row);
                setShowForm(true);
              }}
              onDelete={handleDelete}
              onCreateInvoice={(row) => {
                navigate("/invoices/new", { state: { selectedCustomer: row } });
              }}
            />
          </>
        )}
      </Box>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Hapus Pelanggan</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Yakin ingin menghapus pelanggan ini? Tindakan ini tidak dapat dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Batal
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained" autoFocus>
            Ya, Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerPage;
