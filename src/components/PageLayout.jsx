import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import Sidebar from "./Sidebar";

const PageLayout = ({ title, description, actions, children }) => (
  <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
    <Sidebar />
    <Box component="main" sx={{ ml: { xs: 0, md: "264px" }, p: { xs: 2, sm: 3, lg: 4 }, minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", sm: "center" }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" sx={{ fontSize: { xs: "1.6rem", md: "2rem" } }}>
            {title}
          </Typography>
          {description && <Typography color="text.secondary" sx={{ mt: 0.5 }}>{description}</Typography>}
        </Box>
        {actions && <Stack direction="row" spacing={1}>{actions}</Stack>}
      </Stack>
      {children}
    </Box>
  </Box>
);

export default PageLayout;
