import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import { ReceiptLongOutlined } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import InvoiceForm from "../components/InvoiceForm";

const CreateInvoicePage = () => {

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Sidebar active="/invoices/new" />

      <Box
        sx={{
          flex: 1,
          p: { xs: 2, md: 4 },
          bgcolor: "background.default",
        }}
      >
        <Typography variant="h5" sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}>
          <ReceiptLongOutlined aria-hidden="true" /> Buat Invoice Baru
        </Typography>

        <Paper
          sx={{
            bgcolor: "background.paper",
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (theme) => theme.palette.mode === "dark" ? "0 14px 34px rgba(0,0,0,.24)" : "0 4px 10px rgba(0,0,0,0.05)",
            p: { xs: 2, md: 3 },
            minHeight: "80vh",
          }}
        >
          <InvoiceForm />
        </Paper>
      </Box>
    </Box>
  );
};

export default CreateInvoicePage;
