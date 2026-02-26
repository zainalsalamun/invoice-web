import React from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/id";

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
  Tooltip,
} from "@mui/material";
import { Close as CloseIcon, Visibility, Receipt } from "@mui/icons-material";

dayjs.locale("id");

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

const getApiBase = () => {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return ""; // Kosongkan agar menggunakan proxy Vercel
  let url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  return url.replace("/api", "");
};

const API_BASE = getApiBase();

const CustomerTable = ({ data, onEdit, onDelete, onCreateInvoice, userRole }) => {
  const canDelete = userRole === "super_admin";
  const canCreateInvoice = ["super_admin", "admin", "kasir"].includes(userRole);
  const navigate = useNavigate();
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
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Paket</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>PPN</TableCell>
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
                  <TableCell sx={{ whiteSpace: 'nowrap' }}>
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
                  <TableCell>{row.paket_layanan || "-"}</TableCell>
                  <TableCell>{row.ppn ? formatRupiah(row.ppn) : "-"}</TableCell>
                  <TableCell>{row.nomor_wa || "-"}</TableCell>
                  <TableCell>{formatRupiah(row.harga_langganan)}</TableCell>
                  <TableCell>
                    {row.metode_pembayaran_nama ? (
                      <Chip label={row.metode_pembayaran_nama} size="small" variant="outlined" />
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell>{row.last_invoice_periode || row.tagihan_periode_bulan || "-"}</TableCell>
                  <TableCell>
                    {formatTanggal(row.tanggal_jatuh_tempo)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={(row.last_invoice_status || row.status_pembayaran || "BELUM LUNAS").toUpperCase()}
                        size="small"
                        color={
                          (row.last_invoice_status || row.status_pembayaran || "").toUpperCase() === "LUNAS" ? "success" :
                            (row.last_invoice_status || row.status_pembayaran || "").toUpperCase() === "CICIL" ? "info" : "error"
                        }
                        variant="filled"
                      />
                      {row.bukti_transfer && (
                        <Button
                          size="small"
                          sx={{ minWidth: 'auto', p: '2px 5px', fontSize: '0.65rem', textTransform: 'none' }}
                          variant="contained"
                          color="info"
                          onClick={() => {
                            let path = row.bukti_transfer;
                            if (path.startsWith("http")) path = path.replace(/https?:\/\/43\.134\.180\.249:3000/g, "");
                            const fullPath = path.startsWith("/uploads") ? `${API_BASE}${path}` : `${API_BASE}/uploads/bukti_transfer/${path}`;
                            setPreviewImage(fullPath);
                          }}
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
                  <TableCell sx={{ maxWidth: 150 }}>
                    <Tooltip title={row.notes || ""} placement="top-start">
                      <Typography
                        variant="caption"
                        sx={{
                          fontStyle: 'italic',
                          color: 'text.secondary',
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {row.notes || "-"}
                      </Typography>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center" sx={{ whiteSpace: "nowrap" }}>
                    {canCreateInvoice && (() => {
                      const currentPeriod = dayjs().format("MMMM YYYY").toLowerCase().trim();
                      const lastPeriod = (row.last_invoice_periode || "").toLowerCase().trim();
                      const customerPeriod = (row.tagihan_periode_bulan || "").toLowerCase().trim();

                      const isAlreadyCreated = (row.last_invoice_id && lastPeriod === currentPeriod) || (customerPeriod === currentPeriod);

                      return (
                        <Button
                          variant="contained"
                          size="small"
                          color={isAlreadyCreated ? "primary" : "success"}
                          onClick={() => {
                            if (isAlreadyCreated) {
                              navigate(`/invoices/${row.last_invoice_id}.pdf`);
                            } else {
                              onCreateInvoice(row);
                            }
                          }}
                          startIcon={isAlreadyCreated ? <Visibility fontSize="small" /> : <Receipt fontSize="small" />}
                          sx={{ mr: 1, fontSize: "0.72rem", textTransform: "none" }}
                        >
                          {isAlreadyCreated ? "Lihat Invoice" : "Buat Invoice"}
                        </Button>
                      );
                    })()}
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
                  <TableCell colSpan={13} align="center" sx={{ py: 4, color: "text.secondary" }}>
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
        <DialogContent sx={{ textAlign: 'center', p: 2, display: "flex", flexDirection: "column", gap: 2 }}>
          {previewImage && (
            previewImage.endsWith(".pdf") ? (
              <iframe
                src={previewImage}
                title="Bukti Transfer PDF"
                style={{ width: '100%', minWidth: '400px', height: '600px', maxHeight: '70vh', borderRadius: '8px', border: "1px solid #ccc" }}
              />
            ) : (
              <img
                src={previewImage}
                alt="Bukti Transfer"
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '8px' }}
              />
            )
          )}
          {previewImage && (
            <Button variant="contained" href={previewImage} target="_blank" sx={{ textTransform: "none", alignSelf: "center" }}>
              Buka di Tab Baru
            </Button>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomerTable;
