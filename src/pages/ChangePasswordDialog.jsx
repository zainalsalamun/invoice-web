import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { userService } from "../services/userService";

const ChangePasswordDialog = ({ open, onClose, user }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!newPassword) return setMessage("Password tidak boleh kosong");
    if (newPassword !== confirm) return setMessage("Konfirmasi tidak cocok");

    setLoading(true);
    const res = await userService.updatePassword(user.id, {
      new_password: newPassword,
    });
    setLoading(false);

    if (res?.success) {
      setMessage("✅ Password berhasil diubah!");
      setNewPassword("");
      setConfirm("");
      setTimeout(onClose, 1000);
    } else {
      setMessage("❌ Gagal ubah password");
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>🔑 Ganti Password untuk {user?.username}</DialogTitle>
      <DialogContent>
        {message && (
          <Alert severity={message.includes("✅") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}
        <TextField
          label="Password Baru"
          fullWidth
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          label="Konfirmasi Password"
          fullWidth
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Batal</Button>
        <Button onClick={handleSave} disabled={loading} variant="contained" color="primary">
          {loading ? "Menyimpan..." : "Simpan"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ChangePasswordDialog;
