import React from "react";

const AlertDialog = ({ isOpen, message, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="alert-backdrop">
      <div className="alert-modal">
        <h3>⚠️ Form Belum Lengkap</h3>
        <p>{message}</p>
        <button onClick={onClose}>OK</button>
      </div>
    </div>
  );
};

export default AlertDialog;
