import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const CustomerForm = ({ onSubmit, initialData, onCancel }) => {
  const [form, setForm] = useState(
    initialData || { nama: "", alamat: "", nomor_wa: "", paket: "" }
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      <TextField
        label="Nama"
        name="nama"
        value={form.nama}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Alamat"
        name="alamat"
        value={form.alamat}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Nomor WA"
        name="nomor_wa"
        value={form.nomor_wa}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />
      <TextField
        label="Paket Internet"
        name="paket"
        value={form.paket}
        onChange={handleChange}
        fullWidth
        sx={{ mb: 2 }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={onCancel}>Batal</Button>
        <Button variant="contained" type="submit">Simpan</Button>
      </Box>
    </Box>
  );
};

export default CustomerForm;
