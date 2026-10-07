import React from "react";
import { Box, FormControl, InputLabel, MenuItem, Select, Typography } from "@mui/material";

const InvoicePeriodFilter = ({ period, periods, onChange, error, note }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1.5 }}>
    <FormControl size="small" sx={{ minWidth: 210 }}>
      <InputLabel id="invoice-period-label" shrink>Periode invoice</InputLabel>
      <Select
        labelId="invoice-period-label"
        value={period && periods.some((item) => item.value === period) ? period : ""}
        label="Periode invoice"
        displayEmpty
        renderValue={(selected) => periods.find((item) => item.value === selected)?.label || "Semua periode"}
        onChange={(event) => onChange(event.target.value)}
      >
        <MenuItem value="">Semua periode</MenuItem>
        {periods.map((item) => <MenuItem key={item.value} value={item.value}>{item.label}</MenuItem>)}
      </Select>
    </FormControl>
    <Typography variant="caption" color={error ? "error" : "text.secondary"} sx={{ maxWidth: 560 }}>
      {error || note || "Filter berlaku untuk ringkasan invoice dan pembayaran."}
    </Typography>
  </Box>
);

export default InvoicePeriodFilter;
