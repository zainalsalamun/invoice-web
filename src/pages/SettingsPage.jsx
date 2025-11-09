// import React from "react";
// import Sidebar from "../components/Sidebar";
// import { Button, Box, Typography, Paper } from "@mui/material";
// import { Logout } from "@mui/icons-material";
// import { authService } from "../services/authService";
// import { useNavigate } from "react-router-dom";

// const SettingsPage = () => {
//   const navigate = useNavigate();
//   const user = authService.getCurrentUser();

//   const handleLogout = () => {
//     authService.logout();
//     navigate("/login"); // Redirect ke halaman login setelah logout
//   };

//   return (
//     <Box sx={{ display: "flex", minHeight: "100vh" }}>
//       <Sidebar active="settings" />

//       <Box sx={{ flexGrow: 1, p: 4 }}>
//         <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
//           ⚙️ Pengaturan Akun
//         </Typography>

//         <Paper
//           sx={{
//             p: 3,
//             maxWidth: 500,
//             borderRadius: 3,
//             boxShadow: 3,
//           }}
//         >
//           <Typography variant="subtitle1" sx={{ mb: 1 }}>
//             Username
//           </Typography>
//           <Typography variant="body1" sx={{ mb: 3 }}>
//             {user?.username || "-"}
//           </Typography>

//           <Typography variant="subtitle1" sx={{ mb: 1 }}>
//             Role
//           </Typography>
//           <Typography
//             variant="body1"
//             sx={{
//               mb: 3,
//               textTransform: "capitalize",
//             }}
//           >
//             {user?.role || "-"}
//           </Typography>

//           <Button
//             variant="contained"
//             color="error"
//             startIcon={<Logout />}
//             onClick={handleLogout}
//             sx={{
//               textTransform: "none",
//               fontWeight: 600,
//               mt: 2,
//               px: 3,
//               py: 1,
//               borderRadius: 2,
//             }}
//           >
//             Logout
//           </Button>
//         </Paper>
//       </Box>
//     </Box>
//   );
// };

// export default SettingsPage;



import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import {
  Button,
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Logout } from "@mui/icons-material";
import { authService } from "../services/authService";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [openLogout, setOpenLogout] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="settings" />

      <Box
        sx={{
          flexGrow: 1,
          p: 4,
          backgroundColor: "#f4f6f9",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
          ⚙️ Pengaturan Akun
        </Typography>

        <Paper
          sx={{
            p: 3,
            maxWidth: 500,
            borderRadius: 3,
            boxShadow: 3,
            background: "#fff",
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Username
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            {user?.username || "-"}
          </Typography>

          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Role
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              textTransform: "capitalize",
              fontWeight: 500,
              color:
                user?.role === "admin"
                  ? "#FF5252"
                  : user?.role === "kasir"
                  ? "#4CAF50"
                  : "#2196F3",
            }}
          >
            {user?.role || "-"}
          </Typography>

          <Button
            variant="contained"
            color="error"
            startIcon={<Logout />}
            onClick={() => setOpenLogout(true)}
            sx={{
              textTransform: "none",
              fontWeight: 600,
              mt: 2,
              px: 3,
              py: 1,
              borderRadius: 2,
              boxShadow: "0 3px 8px rgba(255,0,0,0.2)",
              "&:hover": {
                backgroundColor: "#d32f2f",
              },
            }}
          >
            Logout
          </Button>
        </Paper>
      </Box>

      {/* 🔹 Dialog Konfirmasi Logout */}
      <Dialog open={openLogout} onClose={() => setOpenLogout(false)}>
        <DialogTitle>Konfirmasi Logout</DialogTitle>
        <DialogContent>
          <Typography>
            Apakah Anda yakin ingin keluar dari akun ini?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLogout(false)}>Batal</Button>
          <Button
            onClick={handleLogout}
            color="error"
            variant="contained"
            startIcon={<Logout />}
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SettingsPage;
