// import React from "react";
// import { Box, Button, TextField, MenuItem } from "@mui/material";

// const InvoiceFilter = ({ onFilter }) => {
//   const [month, setMonth] = React.useState("");
//   const [status, setStatus] = React.useState("");

//   const handleApply = () => {
//     onFilter({ month, status });
//   };

//   const handleReset = () => {
//     setMonth("");
//     setStatus("");
//     onFilter({ month: "", status: "" });
//   };

//   return (
//     <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
//       <TextField
//         label="Pilih Periode"
//         type="month"
//         size="small"
//         value={month}
//         onChange={(e) => setMonth(e.target.value)}
//       />

//       <TextField
//         label="Status"
//         select
//         size="small"
//         value={status}
//         onChange={(e) => setStatus(e.target.value)}
//         sx={{ minWidth: 160 }}
//       >
//         <MenuItem value="">Semua</MenuItem>
//         <MenuItem value="Lunas">Lunas</MenuItem>
//         <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
//       </TextField>

//       <Button variant="contained" onClick={handleApply}>
//         Terapkan
//       </Button>
//       <Button variant="outlined" color="secondary" onClick={handleReset}>
//         Reset
//       </Button>
//     </Box>
//   );
// };

// export default InvoiceFilter;


import React, { useEffect, useState } from "react";
import { Box, Button, TextField, MenuItem } from "@mui/material";

const InvoiceFilter = ({ onFilter }) => {
  // 🔹 Default ke bulan sekarang (format yyyy-MM)
  const currentMonth = new Date().toISOString().slice(0, 7);
  const [month, setMonth] = useState(currentMonth);
  const [status, setStatus] = useState("");

  // 🔹 Auto-apply filter saat pertama kali load (agar default bulan langsung tampil)
  useEffect(() => {
    onFilter({ month: currentMonth, status: "" });
  }, [onFilter, currentMonth]);

  const handleApply = () => {
    onFilter({ month, status });
  };

  const handleReset = () => {
    setMonth(currentMonth);
    setStatus("");
    onFilter({ month: currentMonth, status: "" });
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
      <TextField
        label="Pilih Periode"
        type="month"
        size="small"
        value={month}
        onChange={(e) => setMonth(e.target.value)}
        sx={{ minWidth: 180 }}
      />

      <TextField
        label="Status"
        select
        size="small"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">Semua</MenuItem>
        <MenuItem value="Lunas">Lunas</MenuItem>
        <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
      </TextField>

      <Button
        variant="contained"
        color="primary"
        onClick={handleApply}
        sx={{ height: 40 }}
      >
        Terapkan
      </Button>
      <Button
        variant="outlined"
        color="secondary"
        onClick={handleReset}
        sx={{ height: 40 }}
      >
        Reset
      </Button>
    </Box>
  );
};

export default InvoiceFilter;
