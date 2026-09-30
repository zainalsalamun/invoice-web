import React from "react";
import { WarningAmberOutlined } from "@mui/icons-material";

const AlertDialog = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-backdrop">
      <div className="alert-modal">
        <h3 style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <WarningAmberOutlined aria-hidden="true" /> Form Belum Lengkap
        </h3>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default AlertDialog;
