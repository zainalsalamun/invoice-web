import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { ArrowBack, ArrowForward } from "@mui/icons-material";

const PaginationControl = ({ page, totalPages, onChange }) => {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, mt: 3 }}>
      <Button
        variant="outlined"
        size="small"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        startIcon={<ArrowBack />}
      >
        Sebelumnya
      </Button>

      <Typography variant="body2">
        Halaman {page} dari {totalPages}
      </Typography>

      <Button
        variant="outlined"
        size="small"
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        endIcon={<ArrowForward />}
      >
        Berikutnya
      </Button>
    </Box>
  );
};

export default PaginationControl;
