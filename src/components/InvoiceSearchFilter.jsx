import React from "react";
import { Box, TextField, MenuItem, Button } from "@mui/material";

const InvoiceSearchFilter = ({ search, status, onSearchChange, onStatusChange, onReset }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        mb: 3,
      }}
    >
      <TextField
        label="Cari pelanggan / nomor invoice"
        variant="outlined"
        size="small"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: "260px" }}
      />

      <TextField
        select
        label="Filter Status"
        variant="outlined"
        size="small"
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        sx={{ width: "200px" }}
      >
        <MenuItem value="">Semua</MenuItem>
        <MenuItem value="Lunas">Lunas</MenuItem>
        <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
      </TextField>

      <Button variant="outlined" color="secondary" onClick={onReset}>
        Reset
      </Button>
    </Box>
  );
};

export default InvoiceSearchFilter;
