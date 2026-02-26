import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import {
  TextField,
  Autocomplete,
  CircularProgress,
  MenuItem,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Paper,
  Typography,
  Grid,
} from "@mui/material";
import AlertDialog from "./AlertDialog";
import { invoiceService } from "../services/invoiceService";
import { customerService } from "../services/customerService";
import { notifySuccess, notifyError } from "../utils/notify";

const InvoiceForm = ({ onPreview }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    namaPelanggan: "",
    alamat: "",
    items: [{ deskripsi: "Paket Internet", harga: "", qty: 1, jumlah: 0 }],
    periode: dayjs().format("YYYY-MM"),
    tanggalJatuhTempo: dayjs().add(7, "day").format("YYYY-MM-DD"),
    statusPembayaran: "Belum Lunas",
    kurang_bayar: 0,
    tanggal_pembayaran: "",
    ppn: 0,
  });

  const location = useLocation();
  const navigate = useNavigate();

  const [buktiFile, setBuktiFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const [customers, setCustomers] = useState([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [errorFields, setErrorFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    nama: "",
    alamat: "",
    paket: "",
    harga_paket: "",
  });

  const refs = {
    namaPelanggan: useRef(null),
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      const data = await customerService.getAll();
      setCustomers(data || []);

      // If we have a selected customer via navigation state
      if (location.state?.selectedCustomer) {
        handleSelectCustomer(null, location.state.selectedCustomer);
      }
      setLoadingCustomers(false);
    };
    fetchCustomers();
  }, [location.state]);

  const handleSelectCustomer = (_, selected) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        customerId: selected.id,
        namaPelanggan: selected.nama,
        alamat: selected.alamat,
        ppn: selected.ppn || 0,
        items: (selected.items && selected.items.length > 0)
          ? selected.items.map(it => ({
            deskripsi: it.deskripsi,
            harga: it.harga,
            qty: it.qty || 1,
            jumlah: it.harga * (it.qty || 1)
          }))
          : [
            {
              deskripsi: selected.paket_layanan || selected.paket || "Paket Internet",
              harga: selected.harga_langganan || selected.harga_paket || "",
              qty: 1,
              jumlah: selected.harga_langganan || selected.harga_paket || 0,
            },
          ],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        namaPelanggan: "",
        alamat: "",
        ppn: 0,
        items: [{ deskripsi: "Paket Internet", harga: "", qty: 1, jumlah: 0 }],
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorFields((prev) => prev.filter((f) => f !== name));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === "harga" || field === "qty") {
      const harga = parseFloat(newItems[index].harga) || 0;
      const qty = parseInt(newItems[index].qty) || 0;
      newItems[index].jumlah = harga * qty;
    }

    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { deskripsi: "", harga: "", qty: 1, jumlah: 0 },
      ],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, items: newItems }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBuktiFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["namaPelanggan"];
    const empty = required.filter((f) => !formData[f]);

    if (empty.length > 0) {
      setErrorFields(empty);
      setShowAlert(true);
      const first = empty[0];
      if (refs[first]?.current) refs[first].current.focus();
      return;
    }

    // Hitung total dari semua items
    const subtotal = formData.items.reduce((sum, item) => sum + (parseFloat(item.jumlah) || 0), 0);
    const ppn = parseFloat(formData.ppn) || 0;
    const total = subtotal + ppn;

    const payload = {
      customer_id: formData.customerId || null,
      nama_pelanggan: formData.namaPelanggan,
      alamat: formData.alamat,
      layanan: formData.items[0]?.deskripsi || "",
      harga_paket: subtotal,
      ppn,
      total,
      periode: formData.periode
        ? dayjs(formData.periode).format("MMMM YYYY")
        : dayjs().format("MMMM YYYY"),
      status_pembayaran: formData.statusPembayaran,
      tanggal_invoice: dayjs().format("YYYY-MM-DD"),
      tanggal_jatuh_tempo: formData.tanggalJatuhTempo,
      kurang_bayar: parseFloat(formData.kurang_bayar) || 0,
      tanggal_pembayaran: formData.tanggal_pembayaran || null,
      items: formData.items.map(it => ({
        deskripsi: it.deskripsi,
        harga: parseFloat(it.harga) || 0,
        qty: parseInt(it.qty) || 1,
        jumlah: parseFloat(it.jumlah) || 0
      })),
    };

    setLoading(true);
    try {
      const result = await invoiceService.create(payload);

      if (result?.success && result.data) {
        if (formData.statusPembayaran === "Lunas" && buktiFile) {
          await invoiceService.uploadProof(result.data.id, buktiFile);
        }
        notifySuccess("Invoice berhasil dibuat!");
        navigate("/invoices");
      } else {
        notifyError(result?.message || "Gagal menyimpan invoice ke server");
      }
    } catch (error) {
      console.error("Error saat kirim data:", error);
      const msg = error.response?.data?.message || "Gagal menyimpan invoice, periksa koneksi server";
      notifyError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async () => {
    if (!newCustomer.nama || !newCustomer.harga_paket) {
      notifyError("Nama dan harga paket wajib diisi!");
      return;
    }

    const result = await customerService.create(newCustomer);
    if (result) {
      setCustomers((prev) => [...prev, result]);
      setFormData((prev) => ({
        ...prev,
        customerId: result.id,
        namaPelanggan: result.nama,
        alamat: result.alamat,
        items: [
          {
            deskripsi: result.paket || "Paket Internet",
            harga: result.harga_paket,
            qty: 1,
            jumlah: result.harga_paket,
          },
        ],
      }));
      setShowNewCustomerModal(false);
      setNewCustomer({ nama: "", alamat: "", paket: "", harga_paket: "" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-start", p: 4, width: "100%" }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            p: 4,
            width: "100%",
            maxWidth: 800,
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: 700 }}>
            🧾 Form Input Invoice
          </Typography>

          <form onSubmit={handleSubmit}>
            <Autocomplete
              options={customers}
              getOptionLabel={(option) =>
                `${option.nama} (${option.paket || "Tanpa Paket"})`
              }
              loading={loadingCustomers}
              value={
                customers.find((c) => c.id === formData.customerId) || null
              }
              onChange={handleSelectCustomer}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Pilih Pelanggan"
                  placeholder="Cari nama pelanggan..."
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        {loadingCustomers ? (
                          <CircularProgress color="inherit" size={20} />
                        ) : null}
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                />
              )}
              sx={{ mb: 2 }}
            />

            <Button
              variant="outlined"
              fullWidth
              sx={{ mb: 3 }}
              onClick={() => setShowNewCustomerModal(true)}
            >
              ➕ Tambah Pelanggan Baru
            </Button>

            <TextField
              label="Nama Pelanggan"
              name="namaPelanggan"
              fullWidth
              inputRef={refs.namaPelanggan}
              value={formData.namaPelanggan}
              onChange={handleChange}
              error={errorFields.includes("namaPelanggan")}
              sx={{ mb: 2 }}
            />

            <TextField
              label="Alamat"
              name="alamat"
              fullWidth
              value={formData.alamat}
              onChange={handleChange}
              sx={{ mb: 4 }}
            />

            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold", borderBottom: "2px solid #eee", pb: 1 }}>
              📦 Paket & Tagihan (Items)
            </Typography>

            {formData.items.map((item, index) => (
              <Box key={index} sx={{ mb: 3, p: 2, border: "1px solid #e0e0e0", borderRadius: 2, bgcolor: "#fafafa" }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Deskripsi Layanan"
                      size="small"
                      fullWidth
                      value={item.deskripsi}
                      onChange={(e) => handleItemChange(index, "deskripsi", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <TextField
                      label="Harga (Rp)"
                      type="number"
                      size="small"
                      fullWidth
                      value={item.harga}
                      onChange={(e) => handleItemChange(index, "harga", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <TextField
                      label="Qty"
                      type="number"
                      size="small"
                      fullWidth
                      value={item.qty}
                      onChange={(e) => handleItemChange(index, "qty", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={1} sx={{ textAlign: "center" }}>
                    <Button
                      color="error"
                      onClick={() => removeItem(index)}
                      sx={{ minWidth: "auto", p: 1 }}
                      disabled={formData.items.length === 1}
                    >
                      🗑️
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            ))}

            <Button
              variant="outlined"
              size="small"
              onClick={addItem}
              sx={{ mb: 4, textTransform: "none" }}
            >
              ➕ Tambah Baris Layanan
            </Button>

            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="PPN (Nominal)"
                  name="ppn"
                  type="number"
                  fullWidth
                  value={formData.ppn}
                  onChange={handleChange}
                  placeholder="0"
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ mb: 4, p: 2, bgcolor: "#f1f5f9", borderRadius: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">Subtotal:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  Rp {formData.items.reduce((sum, item) => sum + (parseFloat(item.jumlah) || 0), 0).toLocaleString("id-ID")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="body2">PPN:</Typography>
                <Typography variant="body2" fontWeight="bold">
                  Rp {(parseFloat(formData.ppn) || 0).toLocaleString("id-ID")}
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: "1px solid #cbd5e1" }}>
                <Typography variant="subtitle1" fontWeight="bold">Total Tagihan:</Typography>
                <Typography variant="subtitle1" fontWeight="bold" color="primary">
                  Rp {(
                    formData.items.reduce((sum, item) => sum + (parseFloat(item.jumlah) || 0), 0) +
                    (parseFloat(formData.ppn) || 0)
                  ).toLocaleString("id-ID")}
                </Typography>
              </Box>
            </Box>

            <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold", color: "text.primary" }}>
              Periode Tagihan
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  value={dayjs(formData.periode).format("MM")}
                  onChange={(e) => {
                    const newMonth = e.target.value;
                    const currentYear = dayjs(formData.periode).format("YYYY");
                    setFormData({ ...formData, periode: `${currentYear}-${newMonth}` });
                  }}
                  size="small"
                >
                  <MenuItem value="01">Januari</MenuItem>
                  <MenuItem value="02">Februari</MenuItem>
                  <MenuItem value="03">Maret</MenuItem>
                  <MenuItem value="04">April</MenuItem>
                  <MenuItem value="05">Mei</MenuItem>
                  <MenuItem value="06">Juni</MenuItem>
                  <MenuItem value="07">Juli</MenuItem>
                  <MenuItem value="08">Agustus</MenuItem>
                  <MenuItem value="09">September</MenuItem>
                  <MenuItem value="10">Oktober</MenuItem>
                  <MenuItem value="11">November</MenuItem>
                  <MenuItem value="12">Desember</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  value={dayjs(formData.periode).format("YYYY")}
                  onChange={(e) => {
                    const newYear = e.target.value;
                    const currentMonth = dayjs(formData.periode).format("MM");
                    setFormData({ ...formData, periode: `${newYear}-${currentMonth}` });
                  }}
                  size="small"
                >
                  {[2024, 2025, 2026, 2027, 2028].map((year) => (
                    <MenuItem key={year} value={String(year)}>
                      {year}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>

            <TextField
              label="Tanggal Jatuh Tempo"
              type="date"
              name="tanggalJatuhTempo"
              fullWidth
              value={formData.tanggalJatuhTempo}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 2 }}
            />

            <TextField
              select
              label="Status Pembayaran"
              name="statusPembayaran"
              fullWidth
              value={formData.statusPembayaran}
              onChange={handleChange}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
              <MenuItem value="Lunas">Lunas</MenuItem>
              <MenuItem value="Cicil">Cicil</MenuItem>
            </TextField>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Nominal Kurang Bayar"
                  name="kurang_bayar"
                  type="number"
                  fullWidth
                  value={formData.kurang_bayar}
                  onChange={handleChange}
                  placeholder="0"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Tanggal Pembayaran"
                  name="tanggal_pembayaran"
                  type="date"
                  fullWidth
                  value={formData.tanggal_pembayaran}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            {formData.statusPembayaran !== "Belum Lunas" && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Bukti Pembayaran (Opsional jika status Cicil/Lunas):
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {previewUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={previewUrl}
                      alt="Preview Bukti"
                      style={{
                        width: "100%",
                        maxWidth: 250,
                        borderRadius: 8,
                        border: "1px solid #ccc",
                      }}
                    />
                  </Box>
                )}
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              fullWidth
              color="primary"
              disabled={loading}
              sx={{
                mt: 1,
                fontWeight: "bold",
                padding: "10px",
                textTransform: "none",
              }}
            >
              {loading ? "💾 Menyimpan..." : "💾 Simpan Invoice"}
            </Button>
          </form>
        </Paper>
      </Box>

      <Dialog
        open={showNewCustomerModal}
        onClose={() => setShowNewCustomerModal(false)}
      >
        <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
        <DialogContent>
          <TextField
            label="Nama"
            fullWidth
            margin="dense"
            value={newCustomer.nama}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, nama: e.target.value })
            }
          />
          <TextField
            label="Alamat"
            fullWidth
            margin="dense"
            value={newCustomer.alamat}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, alamat: e.target.value })
            }
          />
          <TextField
            label="Paket Layanan"
            fullWidth
            margin="dense"
            value={newCustomer.paket}
            onChange={(e) =>
              setNewCustomer({ ...newCustomer, paket: e.target.value })
            }
          />
          <TextField
            label="Harga Paket (Rp)"
            type="number"
            fullWidth
            margin="dense"
            value={newCustomer.harga_paket}
            onChange={(e) =>
              setNewCustomer({
                ...newCustomer,
                harga_paket: e.target.value,
              })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowNewCustomerModal(false)}>Batal</Button>
          <Button variant="contained" onClick={handleAddCustomer}>
            Simpan
          </Button>
        </DialogActions>
      </Dialog>

      <AlertDialog
        isOpen={showAlert}
        message="Nama pelanggan dan item wajib diisi!"
        onClose={() => setShowAlert(false)}
      />
    </>
  );
};

export default InvoiceForm;
