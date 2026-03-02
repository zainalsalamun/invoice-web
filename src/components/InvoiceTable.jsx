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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { FaWhatsapp } from "react-icons/fa";

const InvoiceTable = ({ data, onView, onPrint, onSendWhatsApp, userRole, onDelete }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginatedData = data.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const handleDeleteClick = (invoice) => {
    setSelectedInvoice(invoice);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedInvoice) {
      onDelete(selectedInvoice._id || selectedInvoice.id);
      setOpenDeleteDialog(false);
    }
  };

  return (
    <>
      <Paper sx={{ boxShadow: 3, borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f4f6f8" }}>
                <TableCell><b>Nomor Invoice</b></TableCell>
                <TableCell><b>Nama Pelanggan</b></TableCell>
                <TableCell><b>Periode</b></TableCell>
                <TableCell><b>Total</b></TableCell>
                <TableCell><b>Kurang Bayar</b></TableCell>
                <TableCell><b>Status</b></TableCell>
                <TableCell align="center"><b>Aksi</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.map((row) => (
                <TableRow
                  key={row._id || row.id}
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
                    {row.kurangBayar > 0 ? (
                      <span style={{ color: "red", fontWeight: "bold" }}>
                        Rp {row.kurangBayar.toLocaleString("id-ID")}
                      </span>
                    ) : (
                      "-"
                    )}
                    {row.tanggalPembayaran && (
                      <div style={{ fontSize: "0.7rem", color: "#666" }}>
                        Tgl Bayar: {row.tanggalPembayaran}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={(row.statusPembayaran || "BELUM LUNAS").toUpperCase()}
                      color={
                        (row.statusPembayaran || "").toUpperCase() === "LUNAS" ? "success" :
                          (row.statusPembayaran || "").toUpperCase() === "CICIL" ? "info" : "error"
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

                      {/* Hapus - Hanya Super Admin */}
                      {userRole === "super_admin" && (
                        <Button
                          size="small"
                          variant="contained"
                          color="error"
                          sx={{ textTransform: "none", height: 32 }}
                          onClick={() => handleDeleteClick(row)}
                        >
                          Hapus
                        </Button>
                      )}
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
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Baris per halaman:"
        />
      </Paper>

      {/* Dialog Konfirmasi Hapus */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Konfirmasi Hapus</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Apakah Anda yakin ingin menghapus invoice{" "}
            <b>{selectedInvoice?.nomorInvoice}</b>? Tindakan ini tidak dapat
            dibatalkan.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Batal
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceTable;
