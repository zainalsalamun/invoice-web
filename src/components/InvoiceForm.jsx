// import React, { useState, useEffect, useRef } from "react";
// import dayjs from "dayjs";
// import {
//   TextField,
//   Autocomplete,
//   CircularProgress,
//   MenuItem,
//   Button,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Box,
//   Paper,
//   Typography,
// } from "@mui/material";
// import AlertDialog from "./AlertDialog";
// import { invoiceService } from "../services/invoiceService";
// import { customerService } from "../services/customerService";

// const InvoiceForm = ({ onPreview }) => {
//   const [formData, setFormData] = useState({
//     customerId: "",
//     namaPelanggan: "",
//     alamat: "",
//     layanan: "",
//     hargaPaket: "",
//     periode: "",
//     tanggalJatuhTempo: dayjs().add(7, "day").format("YYYY-MM-DD"),
//     statusPembayaran: "Belum Lunas",
//   });

//   const [customers, setCustomers] = useState([]);
//   const [loadingCustomers, setLoadingCustomers] = useState(false);
//   const [showAlert, setShowAlert] = useState(false);
//   const [errorFields, setErrorFields] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
//   const [newCustomer, setNewCustomer] = useState({
//     nama: "",
//     alamat: "",
//     paket: "",
//     harga_paket: "",
//   });

//   const refs = {
//     namaPelanggan: useRef(null),
//     hargaPaket: useRef(null),
//   };

//   // 🔹 Ambil data pelanggan
//   useEffect(() => {
//     const fetchCustomers = async () => {
//       setLoadingCustomers(true);
//       const data = await customerService.getAll();
//       setCustomers(data || []);
//       setLoadingCustomers(false);
//     };
//     fetchCustomers();
//   }, []);

//   // 🔹 Saat pelanggan dipilih
//   const handleSelectCustomer = (_, selected) => {
//     if (selected) {
//       setFormData((prev) => ({
//         ...prev,
//         customerId: selected.id,
//         namaPelanggan: selected.nama,
//         alamat: selected.alamat,
//         layanan: selected.paket,
//         hargaPaket: selected.harga_paket || "",
//       }));
//     } else {
//       setFormData((prev) => ({
//         ...prev,
//         customerId: "",
//         namaPelanggan: "",
//         alamat: "",
//         layanan: "",
//         hargaPaket: "",
//       }));
//     }
//   };

//   // 🔹 Input form handler
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//     setErrorFields((prev) => prev.filter((f) => f !== name));
//   };

//   // 🔹 Submit invoice
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     const required = ["namaPelanggan", "hargaPaket"];
//     const empty = required.filter((f) => !formData[f]);

//     if (empty.length > 0) {
//       setErrorFields(empty);
//       setShowAlert(true);
//       const first = empty[0];
//       if (refs[first]?.current) refs[first].current.focus();
//       return;
//     }

//     const harga = parseFloat(formData.hargaPaket);
//     const ppn = Math.round(harga * 0.11);
//     const total = harga + ppn;

//     const payload = {
//       customer_id: formData.customerId || null,
//       nama_pelanggan: formData.namaPelanggan,
//       alamat: formData.alamat,
//       layanan: formData.layanan,
//       harga_paket: harga,
//       ppn,
//       total,
//       periode: formData.periode
//         ? dayjs(formData.periode).format("MMMM YYYY")
//         : dayjs().format("MMMM YYYY"),
//       status_pembayaran: formData.statusPembayaran,
//       tanggal_invoice: dayjs().format("YYYY-MM-DD"),
//       tanggal_jatuh_tempo: formData.tanggalJatuhTempo,
//     };

//     setLoading(true);
//     try {
//       const result = await invoiceService.create(payload);
//       setLoading(false);
//       if (result) onPreview(result);
//       else alert("❌ Gagal menyimpan invoice ke server");
//     } catch (error) {
//       console.error("❌ Error saat kirim data:", error);
//       setLoading(false);
//       alert("Gagal menyimpan invoice, periksa koneksi server");
//     }
//   };

//   // 🔹 Tambah pelanggan baru
//   const handleAddCustomer = async () => {
//     if (!newCustomer.nama || !newCustomer.harga_paket) {
//       alert("Nama dan harga paket wajib diisi!");
//       return;
//     }

//     const result = await customerService.create(newCustomer);
//     if (result) {
//       setCustomers((prev) => [...prev, result]);
//       setFormData((prev) => ({
//         ...prev,
//         customerId: result.id,
//         namaPelanggan: result.nama,
//         alamat: result.alamat,
//         layanan: result.paket,
//         hargaPaket: result.harga_paket,
//       }));
//       setShowNewCustomerModal(false);
//       setNewCustomer({ nama: "", alamat: "", paket: "", harga_paket: "" });
//     }
//   };

//   return (
//     <>
//       <Box sx={{ display: "flex", justifyContent: "flex-start", p: 4 }}>
//         <Paper
//           elevation={3}
//           sx={{
//             borderRadius: 3,
//             p: 4,
//             width: "100%",
//             maxWidth: 600,
//             backgroundColor: "#fff",
//             boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
//           }}
//         >
//           <Typography
//             variant="h5"
//             sx={{
//               textAlign: "left",
//               mb: 3,
//               fontWeight: 700,
//               color: "#2f2f2f",
//             }}
//           >
//             🧾 Form Input Invoice
//           </Typography>

//           {/* Dropdown pelanggan */}
//           <Autocomplete
//             options={customers}
//             getOptionLabel={(option) =>
//               `${option.nama} (${option.paket || "Tanpa Paket"})`
//             }
//             loading={loadingCustomers}
//             value={
//               customers.find((c) => c.id === formData.customerId) || null
//             }
//             onChange={handleSelectCustomer}
//             renderInput={(params) => (
//               <TextField
//                 {...params}
//                 label="Pilih Pelanggan"
//                 placeholder="Cari nama pelanggan..."
//                 InputProps={{
//                   ...params.InputProps,
//                   endAdornment: (
//                     <>
//                       {loadingCustomers ? (
//                         <CircularProgress color="inherit" size={20} />
//                       ) : null}
//                       {params.InputProps.endAdornment}
//                     </>
//                   ),
//                 }}
//               />
//             )}
//             sx={{ mb: 2 }}
//           />

//           <Button
//             variant="outlined"
//             fullWidth
//             sx={{ mb: 3 }}
//             onClick={() => setShowNewCustomerModal(true)}
//           >
//             ➕ Tambah Pelanggan Baru
//           </Button>

//           {/* Form input */}
//           <TextField
//             label="Nama Pelanggan"
//             name="namaPelanggan"
//             fullWidth
//             inputRef={refs.namaPelanggan}
//             value={formData.namaPelanggan}
//             onChange={handleChange}
//             error={errorFields.includes("namaPelanggan")}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             label="Alamat"
//             name="alamat"
//             fullWidth
//             value={formData.alamat}
//             onChange={handleChange}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             label="Layanan Internet"
//             name="layanan"
//             fullWidth
//             value={formData.layanan}
//             onChange={handleChange}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             label="Harga Paket (Rp)"
//             type="number"
//             name="hargaPaket"
//             fullWidth
//             inputRef={refs.hargaPaket}
//             value={formData.hargaPaket}
//             onChange={handleChange}
//             error={errorFields.includes("hargaPaket")}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             label="Periode Tagihan"
//             type="month"
//             name="periode"
//             fullWidth
//             value={formData.periode}
//             onChange={handleChange}
//             InputLabelProps={{ shrink: true }}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             label="Tanggal Jatuh Tempo"
//             type="date"
//             name="tanggalJatuhTempo"
//             fullWidth
//             value={formData.tanggalJatuhTempo}
//             onChange={handleChange}
//             InputLabelProps={{ shrink: true }}
//             sx={{ mb: 2 }}
//           />

//           <TextField
//             select
//             label="Status Pembayaran"
//             name="statusPembayaran"
//             fullWidth
//             value={formData.statusPembayaran}
//             onChange={handleChange}
//             sx={{ mb: 3 }}
//           >
//             <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
//             <MenuItem value="Lunas">Lunas</MenuItem>
//           </TextField>

//           <Button
//             type="submit"
//             variant="contained"
//             fullWidth
//             color="primary"
//             disabled={loading}
//             sx={{
//               mt: 1,
//               fontWeight: "bold",
//               padding: "10px",
//               textTransform: "none",
//             }}
//             onClick={handleSubmit}
//           >
//             {loading ? "💾 Menyimpan..." : "📄 Preview Invoice"}
//           </Button>
//         </Paper>
//       </Box>

//       {/* Modal tambah pelanggan */}
//       <Dialog
//         open={showNewCustomerModal}
//         onClose={() => setShowNewCustomerModal(false)}
//       >
//         <DialogTitle>Tambah Pelanggan Baru</DialogTitle>
//         <DialogContent>
//           <TextField
//             label="Nama"
//             fullWidth
//             margin="dense"
//             value={newCustomer.nama}
//             onChange={(e) =>
//               setNewCustomer({ ...newCustomer, nama: e.target.value })
//             }
//           />
//           <TextField
//             label="Alamat"
//             fullWidth
//             margin="dense"
//             value={newCustomer.alamat}
//             onChange={(e) =>
//               setNewCustomer({ ...newCustomer, alamat: e.target.value })
//             }
//           />
//           <TextField
//             label="Paket Layanan"
//             fullWidth
//             margin="dense"
//             value={newCustomer.paket}
//             onChange={(e) =>
//               setNewCustomer({ ...newCustomer, paket: e.target.value })
//             }
//           />
//           <TextField
//             label="Harga Paket (Rp)"
//             type="number"
//             fullWidth
//             margin="dense"
//             value={newCustomer.harga_paket}
//             onChange={(e) =>
//               setNewCustomer({
//                 ...newCustomer,
//                 harga_paket: e.target.value,
//               })
//             }
//           />
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setShowNewCustomerModal(false)}>Batal</Button>
//           <Button variant="contained" onClick={handleAddCustomer}>
//             Simpan
//           </Button>
//         </DialogActions>
//       </Dialog>

//       <AlertDialog
//         isOpen={showAlert}
//         message="Nama pelanggan dan harga wajib diisi!"
//         onClose={() => setShowAlert(false)}
//       />
//     </>
//   );
// };

// export default InvoiceForm;



// src/components/InvoiceForm.jsx
import React, { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
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
} from "@mui/material";
import AlertDialog from "./AlertDialog";
import { invoiceService } from "../services/invoiceService";
import { customerService } from "../services/customerService";

const InvoiceForm = ({ onPreview }) => {
  const [formData, setFormData] = useState({
    customerId: "",
    namaPelanggan: "",
    alamat: "",
    layanan: "",
    hargaPaket: "",
    periode: "",
    tanggalJatuhTempo: dayjs().add(7, "day").format("YYYY-MM-DD"),
    statusPembayaran: "Belum Lunas",
  });

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
    hargaPaket: useRef(null),
  };

  // 🔹 Ambil data pelanggan
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      const data = await customerService.getAll();
      setCustomers(data || []);
      setLoadingCustomers(false);
    };
    fetchCustomers();
  }, []);

  // 🔹 Saat pelanggan dipilih
  const handleSelectCustomer = (_, selected) => {
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        customerId: selected.id,
        namaPelanggan: selected.nama,
        alamat: selected.alamat,
        layanan: selected.paket,
        hargaPaket: selected.harga_paket || "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        customerId: "",
        namaPelanggan: "",
        alamat: "",
        layanan: "",
        hargaPaket: "",
      }));
    }
  };

  // 🔹 Input form handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorFields((prev) => prev.filter((f) => f !== name));
  };

  // 🔹 Submit invoice
  const handleSubmit = async (e) => {
    e.preventDefault();

    const required = ["namaPelanggan", "hargaPaket"];
    const empty = required.filter((f) => !formData[f]);

    if (empty.length > 0) {
      setErrorFields(empty);
      setShowAlert(true);
      const first = empty[0];
      if (refs[first]?.current) refs[first].current.focus();
      return;
    }

    const harga = parseFloat(formData.hargaPaket);
    const ppn = Math.round(harga * 0.11);
    const total = harga + ppn;

    const payload = {
      customer_id: formData.customerId || null,
      nama_pelanggan: formData.namaPelanggan,
      alamat: formData.alamat,
      layanan: formData.layanan,
      harga_paket: harga,
      ppn,
      total,
      periode: formData.periode
        ? dayjs(formData.periode).format("MMMM YYYY")
        : dayjs().format("MMMM YYYY"),
      status_pembayaran: formData.statusPembayaran,
      tanggal_invoice: dayjs().format("YYYY-MM-DD"),
      tanggal_jatuh_tempo: formData.tanggalJatuhTempo,
    };

    setLoading(true);
    try {
      const result = await invoiceService.create(payload);
      setLoading(false);

      // ✅ Kirim hanya data hasilnya, bukan objek response penuh
      if (result?.success && result.data) {
        onPreview(result.data);
      } else {
        alert("❌ Gagal menyimpan invoice ke server");
      }
    } catch (error) {
      console.error("❌ Error saat kirim data:", error);
      setLoading(false);
      alert("Gagal menyimpan invoice, periksa koneksi server");
    }
  };

  // 🔹 Tambah pelanggan baru
  const handleAddCustomer = async () => {
    if (!newCustomer.nama || !newCustomer.harga_paket) {
      alert("Nama dan harga paket wajib diisi!");
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
        layanan: result.paket,
        hargaPaket: result.harga_paket,
      }));
      setShowNewCustomerModal(false);
      setNewCustomer({ nama: "", alamat: "", paket: "", harga_paket: "" });
    }
  };

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "flex-start", p: 4 }}>
        <Paper
          elevation={3}
          sx={{
            borderRadius: 3,
            p: 4,
            width: "100%",
            maxWidth: 600,
            backgroundColor: "#fff",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          }}
        >
          <Typography
            variant="h5"
            sx={{
              textAlign: "left",
              mb: 3,
              fontWeight: 700,
              color: "#2f2f2f",
            }}
          >
            🧾 Form Input Invoice
          </Typography>

          {/* Dropdown pelanggan */}
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

          {/* Form input */}
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
            sx={{ mb: 2 }}
          />

          <TextField
            label="Layanan Internet"
            name="layanan"
            fullWidth
            value={formData.layanan}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Harga Paket (Rp)"
            type="number"
            name="hargaPaket"
            fullWidth
            inputRef={refs.hargaPaket}
            value={formData.hargaPaket}
            onChange={handleChange}
            error={errorFields.includes("hargaPaket")}
            sx={{ mb: 2 }}
          />

          <TextField
            label="Periode Tagihan"
            type="month"
            name="periode"
            fullWidth
            value={formData.periode}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />

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
            sx={{ mb: 3 }}
          >
            <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
            <MenuItem value="Lunas">Lunas</MenuItem>
          </TextField>

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
            onClick={handleSubmit}
          >
            {loading ? "💾 Menyimpan..." : "📄 Preview Invoice"}
          </Button>
        </Paper>
      </Box>

      {/* Modal tambah pelanggan */}
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
        message="Nama pelanggan dan harga wajib diisi!"
        onClose={() => setShowAlert(false)}
      />
    </>
  );
};

export default InvoiceForm;
