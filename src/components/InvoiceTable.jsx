import React, { useState } from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  Button,
  TablePagination,
  Chip,
} from "@mui/material";

const InvoiceTable = ({ data }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Paper sx={{ boxShadow: 3, borderRadius: 2 }}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
              <TableCell><b>Nomor Invoice</b></TableCell>
              <TableCell><b>Nama Pelanggan</b></TableCell>
              <TableCell><b>Periode</b></TableCell>
              <TableCell><b>Total</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell align="center"><b>Aksi</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, i) => (
              <TableRow
                key={i}
                hover
                sx={{
                  backgroundColor:
                    row.statusPembayaran === "Lunas"
                      ? "rgba(76, 175, 80, 0.05)"
                      : "rgba(255, 193, 7, 0.05)",
                }}
              >
                <TableCell>{row.nomorInvoice}</TableCell>
                <TableCell>{row.namaPelanggan}</TableCell>
                <TableCell>{row.periode}</TableCell>
                <TableCell>Rp {row.total.toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <Chip
                    label={row.statusPembayaran}
                    color={row.statusPembayaran === "Lunas" ? "success" : "warning"}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="outlined"
                    color="primary"
                    sx={{ mr: 1 }}
                    onClick={() =>
                      window.open(`/invoices/${row.nomorInvoice}.pdf`, "_blank")
                    }
                  >
                    Lihat
                  </Button>
                  <Button size="small" variant="contained" color="success">
                    Cetak
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Baris per halaman:"
      />
    </Paper>
  );
};

export default InvoiceTable;
