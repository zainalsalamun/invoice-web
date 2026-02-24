import React from "react";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TableContainer,
  TablePagination,
  Chip,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

const formatRupiah = (value) => {
  if (!value && value !== 0) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

const formatTanggal = (iso) => {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const API_BASE = (process.env.REACT_APP_API_URL || "http://localhost:5000/api").replace("/api", "");

const CustomerTable = ({ data, onEdit, onDelete, userRole }) => {
  const canDelete = userRole === "super_admin";
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [previewImage, setPreviewImage] = React.useState(null);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const paginated = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <>
      <Paper sx={{ borderRadius: 2, boxShadow: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Nama</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Kategori</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>WA</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Harga</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Metode</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tagihan (Bulan)</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Jatuh Tempo</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status Bayar</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Notes</TableCell>
                <TableCell align="center" sx={{ color: "#fff", fontWeight: "bold" }}>
                  Aksi
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {paginated.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                      {row.id_pelanggan || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {row.nama}
                    </Typography>
                  </TableCell>
                  <TableCell>{row.kategori_pelanggan || "-"}</TableCell>
                  <TableCell>{row.nomor_wa || "-"}</TableCell>
                  <TableCell>{formatRupiah(row.harga_langganan)}</TableCell>
                  <TableCell>
                    {row.metode_pembayaran_nama ? (
                      <Chip label={row.metode_pembayaran_nama} size="small" variant="outlined" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{row.tagihan_periode_bulan || "-"}</TableCell>
                  <TableCell>
                    {formatTanggal(row.tanggal_jatuh_tempo)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={row.status_pembayaran || "BELUM LUNAS"}
                        size="small"
                        color={row.status_pembayaran === "LUNAS" ? "success" : "error"}
                        variant="filled"
                      />
                      {row.bukti_transfer && (
                        <Button
                          size="small"
                          sx={{ minWidth: 'auto', p: '2px 5px', fontSize: '0.65rem', textTransform: 'none' }}
                          variant="contained"
                          color="info"
                          onClick={() => setPreviewImage(`${API_BASE}/uploads/bukti_transfer/${row.bukti_transfer}`)}
                        >
                          Bukti
                        </Button>
                      )}
                    </Box>
                    {row.aktif === false && (
                      <Chip
                        label="Nonaktif"
                        size="small"
                        color="default"
                        variant="filled"
                        sx={{ mt: 0.5, display: "block" }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>
                      {row.notes || "-"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onEdit(row)}
                      sx={{ mr: 1, fontSize: "0.72rem" }}
                    >
                      Edit
                    </Button>
                    {canDelete && (
                      <Button
                        variant="contained"
                        size="small"
                        color="error"
                        onClick={() => onDelete(row.id)}
                        sx={{ fontSize: "0.72rem" }}
                      >
                        Hapus
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {data.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} align="center" sx={{ py: 4, color: "text.secondary" }}>
                    📭 Tidak ada data pelanggan.
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

      <Dialog open={!!previewImage} onClose={() => setPreviewImage(null)} maxWidth="md">
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Bukti Transfer
          <IconButton onClick={() => setPreviewImage(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 2 }}>
          {previewImage && (
            <img
              src={previewImage}
              alt="Bukti Transfer"
              style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerTable;
