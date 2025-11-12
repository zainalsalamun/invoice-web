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
  Stack,
} from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";

const InvoiceTable = ({ data, onView, onPrint, onSendWhatsApp }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

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
                  transition: "0.2s ease",
                  "&:hover": {
                    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                    transform: "scale(1.002)",
                  },
                }}
              >
                <TableCell>{row.nomorInvoice}</TableCell>
                <TableCell>{row.namaPelanggan}</TableCell>
                <TableCell>{row.periode}</TableCell>
                <TableCell>Rp {row.total.toLocaleString("id-ID")}</TableCell>
                <TableCell>
                  <Chip
                    label={row.statusPembayaran}
                    color={
                      row.statusPembayaran === "Lunas" ? "success" : "warning"
                    }
                    size="small"
                  />
                </TableCell>

                <TableCell align="center">
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    alignItems="center"
                    sx={{ flexWrap: "wrap" }}
                  >
                    {/*Detail */}
                    <Button
                      size="small"
                      variant="outlined"
                      color="info"
                      sx={{ textTransform: "none", height: 32 }}
                      onClick={() => onView(row)}
                    >
                      Detail
                    </Button>

                    {/*Cetak */}
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      sx={{ textTransform: "none", height: 32 }}
                      onClick={() => onPrint(row)}
                    >
                      Cetak
                    </Button>

                    {/*Kirim WA */}
                    <Button
                    size="small"
                    variant="contained"
                    sx={{
                      backgroundColor: "#25D366",
                      color: "white",
                      "&:hover": { backgroundColor: "#1EBE57" },
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      px: 2,
                    }}
                    onClick={() => onSendWhatsApp(row)}
                   >
                    <FaWhatsapp size={18} />
                    Kirim WA
                  </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  Tidak ada data invoice.
                </TableCell>
              </TableRow>
            )}
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
