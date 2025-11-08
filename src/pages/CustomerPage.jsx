import React, { useEffect, useState } from "react";
import { Box, Button, Typography, Snackbar, Alert } from "@mui/material";
import Sidebar from "../components/Sidebar";
import CustomerTable from "../components/CustomerTable";
import CustomerForm from "../components/CustomerForm";
import { customerService } from "../services/customerService";

const CustomerPage = () => {
  const [customers, setCustomers] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchData = async () => {
    const data = await customerService.getAll();
    setCustomers(data);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async (formData) => {
    if (editing) {
      await customerService.update(editing.id, formData);
      setSnackbar({ open: true, message: "Pelanggan diperbarui!", severity: "success" });
    } else {
      await customerService.create(formData);
      setSnackbar({ open: true, message: "Pelanggan ditambahkan!", severity: "success" });
    }
    setShowForm(false);
    setEditing(null);
    fetchData();
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin hapus pelanggan ini?")) {
      await customerService.remove(id);
      fetchData();
      setSnackbar({ open: true, message: "Pelanggan dihapus!", severity: "info" });
    }
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="customers" />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h5" sx={{ mb: 3 }}>
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
              sx={{ mb: 2 }}
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

        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar((p) => ({ ...p, open: false }))}
        >
          <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default CustomerPage;
