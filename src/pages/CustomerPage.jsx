import React, { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import Sidebar from "../components/Sidebar";
import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import { customerService } from "../services/customerService";
import { notifySuccess, notifyInfo, notifyError } from "../utils/notify"; // ✅ pakai notifikasi global

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error("Gagal ambil data pelanggan:", err);
      notifyError("Gagal memuat data pelanggan");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus pelanggan ini?")) {
      try {
        await customerService.remove(id);
        notifyInfo("🗑️ Pelanggan berhasil dihapus");
        fetchData();
      } catch (err) {
        console.error("Gagal hapus pelanggan:", err);
        notifyError("Gagal menghapus pelanggan");
      }
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="customers" />

      <Box sx={{ flexGrow: 1, p: 4 }}>
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
            <Button
              variant="contained"
              sx={{
                mb: 2,
                fontWeight: "bold",
                textTransform: "none",
                borderRadius: 2,
                boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              }}
              onClick={() => setShowForm(true)}
            >
              ➕ Tambah Pelanggan
            </Button>

            <CustomerTable
              data={customers}
              onEdit={(row) => {
                setEditing(row);
                setShowForm(true);
              }}
              onDelete={handleDelete}
            />
          </>
        )}
      </Box>
    </Box>
  );
};

export default CustomerPage;
