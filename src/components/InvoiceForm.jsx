import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import "dayjs/locale/id";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Button,
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Divider,
  Alert,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Inventory as PackageIcon,
  Lock as LockIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";
import AlertDialog from "./AlertDialog";
import { invoiceService } from "../services/invoiceService";
import { customerService } from "../services/customerService";
import { notifySuccess, notifyError } from "../utils/notify";

dayjs.locale("id");

const formatRp = (val) =>
  `Rp ${Number(val || 0).toLocaleString("id-ID", { maximumFractionDigits: 0 })}`;

const getInitials = (name = "") => {
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColors = ["#1565c0", "#2e7d32", "#e65100", "#6a1b9a", "#c62828", "#00695c"];
const getColor = (name = "") => avatarColors[name.charCodeAt(0) % avatarColors.length] || "#1565c0";

// ─── Baris info pelanggan (read-only badge) ───────────────────────────────────
const InfoBadge = ({ icon, label, value, highlight }) => (
  <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, py: 0.6 }}>
    <Box sx={{ color: "text.disabled", mt: 0.2, flexShrink: 0 }}>{icon}</Box>
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        fontWeight={600}
        color={highlight || "text.primary"}
        sx={{ lineHeight: 1.4 }}
      >
        {value || "-"}
      </Typography>
    </Box>
  </Box>
);

// ─── Komponen utama ───────────────────────────────────────────────────────────
const InvoiceForm = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [showDuplicateDialog, setShowDuplicateDialog] = useState(false);
  const [duplicateMsg, setDuplicateMsg] = useState("");
  const [ppnEnabled, setPpnEnabled] = useState(false); // toggle PPN

  // Customer yang dipilih (object lengkap)
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Field yang bisa diubah admin
  const [periode, setPeriode] = useState(dayjs().format("YYYY-MM"));
  const [statusPembayaran, setStatusPembayaran] = useState("Belum Lunas");
  const [tanggalJatuhTempo, setTanggalJatuhTempo] = useState(
    dayjs().add(30, "day").format("YYYY-MM-DD")
  );

  // ── Load daftar pelanggan ──────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      setLoadingCustomers(true);
      try {
        const data = await customerService.getAll();
        setCustomers(data || []);

        // Kalau dari CustomerTable → klik "Buat Invoice"
        if (location.state?.selectedCustomer) {
          handleSelectCustomer(null, location.state.selectedCustomer);
        }
      } catch (err) {
        console.error("Gagal memuat pelanggan:", err);
      } finally {
        setLoadingCustomers(false);
      }
    };
    fetch();
    // eslint-disable-next-line
  }, []);

  // ── Saat pelanggan dipilih: sync semua data ───────────────────────────
  const handleSelectCustomer = (_, customer) => {
    setSelectedCustomer(customer || null);
    // Auto-aktifkan PPN jika customer memiliki nilai PPN > 0
    setPpnEnabled(customer ? Number(customer.ppn || 0) > 0 : false);
    if (customer?.tanggal_jatuh_tempo) {
      setTanggalJatuhTempo(
        dayjs(customer.tanggal_jatuh_tempo).format("YYYY-MM-DD")
      );
    } else {
      setTanggalJatuhTempo(dayjs().add(30, "day").format("YYYY-MM-DD"));
    }
  };


  // ── Kalkulasi final invoice ────────────────────────────────────────────
  const items = selectedCustomer
    ? selectedCustomer.items && selectedCustomer.items.length > 0
      ? selectedCustomer.items
      : [
        {
          deskripsi: selectedCustomer.paket_layanan || selectedCustomer.paket || "Paket Internet",
          harga: selectedCustomer.harga_langganan || selectedCustomer.harga_paket || 0,
          qty: 1,
          jumlah: selectedCustomer.harga_langganan || selectedCustomer.harga_paket || 0,
        },
      ]
    : [];

  const subtotal = items.reduce((s, it) => s + Number(it.jumlah || it.harga * (it.qty || 1) || 0), 0);
  // PPN: hanya dihitung jika ppnEnabled = true, nilai dari customer.ppn atau hitung 11% dari subtotal
  const ppnRawAmount = selectedCustomer ? Number(selectedCustomer.ppn || 0) : 0;
  const ppnValue = ppnEnabled
    ? (ppnRawAmount > 0 ? ppnRawAmount : Math.round(subtotal * 0.11))
    : 0;
  const totalTagihan = subtotal + ppnValue;

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedCustomer) {
      setAlertMsg("Pilih pelanggan terlebih dahulu!");
      setShowAlert(true);
      return;
    }

    const payload = {
      customer_id: selectedCustomer._id || selectedCustomer.id,
      nama_pelanggan: selectedCustomer.nama,
      alamat: selectedCustomer.alamat,
      layanan: items[0]?.deskripsi || "",
      harga_paket: subtotal,
      ppn: ppnValue,
      total: subtotal,          // DPP saja yang disimpan (konsisten dgn InvoiceViewer)
      periode: dayjs(periode).locale("id").format("MMMM YYYY"),
      status_pembayaran: statusPembayaran,
      tanggal_invoice: dayjs().format("YYYY-MM-DD"),
      tanggal_jatuh_tempo: tanggalJatuhTempo,
      kurang_bayar: 0,
      tanggal_pembayaran: statusPembayaran === "Lunas" ? dayjs().format("YYYY-MM-DD") : null,
      items: items.map((it) => ({
        deskripsi: it.deskripsi,
        harga: Number(it.harga || 0),
        qty: Number(it.qty || 1),
        jumlah: Number(it.jumlah || it.harga * (it.qty || 1) || 0),
      })),
    };

    setLoading(true);
    try {
      const result = await invoiceService.create(payload);
      if (result?.success && result.data) {
        // Kalau langsung tandai lunas saat buat → update status customer juga via upload endpoint
        if (statusPembayaran === "Lunas") {
          const invId = result.data._id || result.data.id;
          // Tandai lunas tanpa file (kita kirim PUT biasa)
          await invoiceService.update(invId, {
            ...payload,
            status_pembayaran: "Lunas",
            tanggal_pembayaran: dayjs().format("YYYY-MM-DD"),
          });
        }
        notifySuccess("Invoice berhasil dibuat!");
        navigate("/invoices");
      } else {
        notifyError(result?.message || "Gagal menyimpan invoice ke server");
      }
    } catch (error) {
      console.error("Error saat kirim data:", error);
      const status = error.response?.status;
      const msg = error.response?.data?.message || "";

      // 409 = duplikat periode → tampilkan dialog khusus
      if (status === 409 || msg.includes("sudah ada")) {
        setDuplicateMsg(msg || `Invoice untuk periode ini sudah ada.`);
        setShowDuplicateDialog(true);
      } else {
        notifyError(msg || "Gagal menyimpan invoice, periksa koneksi server");
      }
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 860, mx: "auto" }}>
        {/* ── STEP 1: Pilih Pelanggan ── */}
        <Paper elevation={0} sx={{ border: "1px solid #e8e8e8", borderRadius: 2, p: 3, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            1 · Pilih Pelanggan
          </Typography>

          <Autocomplete
            options={customers}
            getOptionLabel={(opt) =>
              `${opt.nama} — ${opt.kategori_pelanggan || opt.paket || "Tanpa Paket"}`
            }
            loading={loadingCustomers}
            value={selectedCustomer}
            onChange={handleSelectCustomer}
            isOptionEqualToValue={(opt, val) =>
              (opt._id || opt.id) === (val._id || val.id)
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Cari nama pelanggan..."
                placeholder="Ketik nama atau kategori"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {loadingCustomers ? (
                        <CircularProgress color="inherit" size={18} />
                      ) : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />

          {/* ── Info card pelanggan yang dipilih (read-only) ── */}
          {selectedCustomer && (
            <Box
              sx={{
                mt: 2.5,
                p: 2,
                bgcolor: "#f0f7ff",
                borderRadius: 2,
                border: "1px solid #bbdefb",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: 16,
                    fontWeight: 700,
                    bgcolor: getColor(selectedCustomer.nama),
                  }}
                >
                  {getInitials(selectedCustomer.nama)}
                </Avatar>
                <Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {selectedCustomer.nama}
                    </Typography>
                    <Chip
                      label={selectedCustomer.id_pelanggan}
                      size="small"
                      variant="outlined"
                      sx={{ fontFamily: "monospace", fontSize: "0.7rem", height: 20 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCustomer.kategori_pelanggan}
                  </Typography>
                </Box>
                <Box sx={{ ml: "auto" }}>
                  <Chip
                    icon={<LockIcon sx={{ fontSize: "14px !important" }} />}
                    label="Data terkunci dari profil pelanggan"
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontSize: "0.68rem" }}
                  />
                </Box>
              </Box>

              <Divider sx={{ mb: 1.5 }} />

              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <InfoBadge
                    icon={<LocationIcon fontSize="small" />}
                    label="Alamat"
                    value={selectedCustomer.alamat}
                  />
                  <InfoBadge
                    icon={<PhoneIcon fontSize="small" />}
                    label="WhatsApp"
                    value={selectedCustomer.nomor_wa}
                    highlight="#2e7d32"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <InfoBadge
                    icon={<PackageIcon fontSize="small" />}
                    label="Paket Layanan"
                    value={selectedCustomer.paket_layanan || selectedCustomer.paket}
                  />
                  <InfoBadge
                    icon={<PersonIcon fontSize="small" />}
                    label="Metode Pembayaran"
                    value={selectedCustomer.metode_pembayaran_nama}
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>

        {/* ── STEP 2: Detail Item (dari pelanggan, read-only) ── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e8e8e8",
            borderRadius: 2,
            p: 3,
            mb: 3,
            opacity: selectedCustomer ? 1 : 0.45,
            pointerEvents: selectedCustomer ? "auto" : "none",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              2 · Rincian Tagihan
            </Typography>
            {selectedCustomer && (
              <Chip
                icon={<LockIcon sx={{ fontSize: "14px !important" }} />}
                label="Dari data paket pelanggan"
                size="small"
                color="default"
                sx={{ fontSize: "0.68rem" }}
              />
            )}
          </Box>

          {/* Tabel item */}
          <Box sx={{ border: "1px solid #f0f0f0", borderRadius: 1.5, overflow: "hidden" }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 120px 60px 130px",
                bgcolor: "#f7f8fa",
                px: 2,
                py: 1,
              }}
            >
              {["Keterangan", "Harga", "Qty", "Subtotal"].map((h) => (
                <Typography key={h} variant="caption" fontWeight={700} color="text.secondary">
                  {h}
                </Typography>
              ))}
            </Box>

            {items.length === 0 ? (
              <Box sx={{ px: 2, py: 3, textAlign: "center", color: "text.disabled" }}>
                <Typography variant="body2">Pilih pelanggan untuk melihat rincian paket</Typography>
              </Box>
            ) : (
              items.map((it, idx) => (
                <Box
                  key={idx}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "1fr 120px 60px 130px",
                    px: 2,
                    py: 1.2,
                    borderTop: idx > 0 ? "1px solid #f0f0f0" : "none",
                    bgcolor: idx % 2 === 0 ? "#fff" : "#fcfcfc",
                  }}
                >
                  <Typography variant="body2">{it.deskripsi || "-"}</Typography>
                  <Typography variant="body2">{formatRp(it.harga)}</Typography>
                  <Typography variant="body2">{it.qty || 1}</Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatRp(it.jumlah || it.harga * (it.qty || 1))}
                  </Typography>
                </Box>
              ))
            )}
          </Box>

          {/* Ringkasan total */}
          {selectedCustomer && (
            <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ width: 320 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="body2" color="text.secondary">DPP (Dasar Pengenaan Pajak)</Typography>
                  <Typography variant="body2" fontWeight={600}>{formatRp(subtotal)}</Typography>
                </Box>
                {/* Toggle PPN */}
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", py: 0.5 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={ppnEnabled}
                        onChange={(e) => setPpnEnabled(e.target.checked)}
                        size="small"
                        color="primary"
                      />
                    }
                    label={
                      <Typography variant="body2" color="text.secondary">
                        PPN {ppnEnabled
                          ? (ppnRawAmount > 0 ? `(dari profil)` : `(11%)`)
                          : `(tidak dikenakan)`}
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />
                  <Typography variant="body2" fontWeight={600} color={ppnEnabled ? "text.primary" : "text.disabled"}>
                    {ppnEnabled ? formatRp(ppnValue) : "-"}
                  </Typography>
                </Box>
                <Divider sx={{ my: 0.5 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>Total Tagihan</Typography>
                  <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                    {formatRp(totalTagihan)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}

        </Paper>

        {/* ── STEP 3: Setting Periode & Status (admin bisa ubah) ── */}
        <Paper
          elevation={0}
          sx={{
            border: "1px solid #e8e8e8",
            borderRadius: 2,
            p: 3,
            mb: 3,
            opacity: selectedCustomer ? 1 : 0.45,
            pointerEvents: selectedCustomer ? "auto" : "none",
          }}
        >
          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
            3 · Pengaturan Invoice
          </Typography>

          <Grid container spacing={2}>
            {/* Periode — Bulan */}
            <Grid item xs={6} sm={3}>
              <TextField
                select
                label="Bulan Tagihan"
                size="small"
                fullWidth
                value={dayjs(periode).format("MM")}
                onChange={(e) => {
                  const yr = dayjs(periode).format("YYYY");
                  setPeriode(`${yr}-${e.target.value}`);
                }}
              >
                {[
                  ["01", "Januari"], ["02", "Februari"], ["03", "Maret"],
                  ["04", "April"], ["05", "Mei"], ["06", "Juni"],
                  ["07", "Juli"], ["08", "Agustus"], ["09", "September"],
                  ["10", "Oktober"], ["11", "November"], ["12", "Desember"],
                ].map(([v, l]) => (
                  <MenuItem key={v} value={v}>{l}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Periode — Tahun */}
            <Grid item xs={6} sm={3}>
              <TextField
                select
                label="Tahun"
                size="small"
                fullWidth
                value={dayjs(periode).format("YYYY")}
                onChange={(e) => {
                  const mo = dayjs(periode).format("MM");
                  setPeriode(`${e.target.value}-${mo}`);
                }}
              >
                {[2024, 2025, 2026, 2027, 2028].map((y) => (
                  <MenuItem key={y} value={String(y)}>{y}</MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Jatuh Tempo */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Tanggal Jatuh Tempo"
                type="date"
                size="small"
                fullWidth
                value={tanggalJatuhTempo}
                onChange={(e) => setTanggalJatuhTempo(e.target.value)}
                InputLabelProps={{ shrink: true }}
                helperText={
                  selectedCustomer?.tanggal_jatuh_tempo
                    ? `Dari profil pelanggan: ${dayjs(selectedCustomer.tanggal_jatuh_tempo).format("D MMMM YYYY")}`
                    : undefined
                }
              />
            </Grid>

            {/* Status Pembayaran */}
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status Pembayaran"
                size="small"
                fullWidth
                value={statusPembayaran}
                onChange={(e) => setStatusPembayaran(e.target.value)}
              >
                <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
                <MenuItem value="Lunas">Lunas</MenuItem>
                <MenuItem value="Cicil">Cicil</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {statusPembayaran === "Belum Lunas" && (
            <Alert severity="info" sx={{ mt: 2, fontSize: "0.8rem" }}>
              Invoice akan diterbitkan dengan status <b>Belum Lunas</b>. Admin bisa menandai Lunas nanti setelah pelanggan membayar.
            </Alert>
          )}
          {statusPembayaran === "Lunas" && (
            <Alert severity="success" sx={{ mt: 2, fontSize: "0.8rem" }}>
              Invoice langsung ditandai <b>Lunas</b>. Status pelanggan akan diperbarui otomatis.
            </Alert>
          )}
          {statusPembayaran === "Cicil" && (
            <Alert severity="warning" sx={{ mt: 2, fontSize: "0.8rem" }}>
              Invoice ditandai <b>Cicil</b>. Tandai Lunas nanti dari halaman daftar invoice.
            </Alert>
          )}
        </Paper>

        {/* ── RINGKASAN FINAL sebelum simpan ── */}
        {selectedCustomer && (
          <Paper
            elevation={0}
            sx={{
              border: "1px solid #e0f2f1",
              bgcolor: "#f0fdf4",
              borderRadius: 2,
              p: 3,
              mb: 3,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <CheckIcon color="success" fontSize="small" />
              <Typography variant="subtitle2" fontWeight={700} color="success.dark">
                Ringkasan Invoice
              </Typography>
            </Box>
            <Grid container spacing={1}>
              {[
                ["Pelanggan", selectedCustomer.nama],
                ["ID Pelanggan", selectedCustomer.id_pelanggan],
                ["Periode", dayjs(periode).locale("id").format("MMMM YYYY")],
                ["Jatuh Tempo", dayjs(tanggalJatuhTempo).format("D MMMM YYYY")],
                ["Total Tagihan", formatRp(totalTagihan)],
                ["Status", statusPembayaran],
              ].map(([k, v]) => (
                <Grid item xs={6} sm={4} key={k}>
                  <Typography variant="caption" color="text.secondary">{k}</Typography>
                  <Typography variant="body2" fontWeight={600}>{v}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}

        {/* ── TOMBOL SIMPAN ── */}
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => navigate("/invoices")}
            sx={{ textTransform: "none", fontWeight: 600, px: 3 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedCustomer || loading}
            onClick={handleSubmit}
            sx={{ textTransform: "none", fontWeight: 700, px: 4, flexGrow: 1 }}
          >
            {loading ? "💾 Menyimpan..." : "💾 Terbitkan Invoice"}
          </Button>
        </Box>
      </Box>

      <AlertDialog
        isOpen={showAlert}
        message={alertMsg}
        onClose={() => setShowAlert(false)}
      />

      {/* ── Dialog: Invoice duplikat periode ── */}
      <Dialog open={showDuplicateDialog} onClose={() => setShowDuplicateDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pb: 1 }}>
          <span style={{ fontSize: 22 }}>⚠️</span> Invoice Sudah Ada
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            {duplicateMsg}
          </Typography>
          <Typography variant="body2">
            Pilihan yang bisa dilakukan:
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, mt: 0.5, mb: 0 }}>
            <li><Typography variant="body2">Ubah <b>periode tagihan</b> ke bulan yang berbeda</Typography></li>
            <li><Typography variant="body2">Buka <b>Daftar Invoice</b> untuk melihat invoice yang sudah ada</Typography></li>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => setShowDuplicateDialog(false)}
            sx={{ textTransform: "none" }}
          >
            Tutup & Ubah Periode
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => { setShowDuplicateDialog(false); navigate("/invoices"); }}
            sx={{ textTransform: "none" }}
          >
            Ke Daftar Invoice
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InvoiceForm;
