import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Snackbar,
} from "@mui/material";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("sessionExpired") === "true") {
      setSessionExpired(true);
      localStorage.removeItem("sessionExpired"); 
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await authService.login(form.username, form.password);

    if (res?.success) {
      navigate("/");
    } else {
      setError(res?.message || "Login gagal, periksa kembali kredensial Anda.");
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4facfe 0%, #0052d4 100%)",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Paper
        elevation={6}
        sx={{
          width: "100%",
          maxWidth: 400,
          borderRadius: 3,
          p: 4,
          textAlign: "center",
        }}
      >
        {/* Logo Ringnet */}
        <img
          src={require("../assets/logoringnet.png")}
          alt="Ringnet"
          style={{
            width: 100,
            marginBottom: 10,
            background: "#fff",
            padding: 8,
            borderRadius: 12,
            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
          }}
        />

        <Typography variant="h6" fontWeight="bold" gutterBottom>
          Ringnet Admin
        </Typography>
        <Typography
          variant="body2"
          sx={{ mb: 3, color: "text.secondary", fontSize: 14 }}
        >
          Silakan masuk ke akun Anda
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2, fontSize: 13 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            variant="outlined"
            value={form.username}
            onChange={handleChange}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            variant="outlined"
            value={form.password}
            onChange={handleChange}
            sx={{ mb: 3 }}
          />

          <Button
            fullWidth
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              background: "linear-gradient(90deg, #007bff 0%, #0052d4 100%)",
              fontWeight: 600,
              borderRadius: 2,
              py: 1.2,
              textTransform: "none",
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Masuk"
            )}
          </Button>
        </form>

        <Typography
          variant="body2"
          sx={{
            mt: 3,
            fontSize: 13,
            color: "text.secondary",
          }}
        >
          © {new Date().getFullYear()} Ringnet ISP. All Rights Reserved.
        </Typography>
      </Paper>

      {/* 🔔 Snackbar notifikasi session expired */}
      <Snackbar
        open={sessionExpired}
        autoHideDuration={4000}
        onClose={() => setSessionExpired(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="warning" sx={{ width: "100%" }}>
          ⚠️ Sesi Anda telah berakhir. Silakan login ulang.
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoginPage;
