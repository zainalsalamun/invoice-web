import React, { useState } from "react";

const WhatsAppDialog = ({ isOpen, onClose, onSend }) => {
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  return (
    <div className="wa-modal-backdrop">
      <div className="wa-modal">
        <h3>Kirim Invoice via WhatsApp</h3>
        <p>Masukkan nomor WhatsApp pelanggan:</p>
        <input
          type="tel"
          placeholder="Contoh: 6281234567890"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <div className="wa-modal-buttons">
          <button className="cancel" onClick={onClose}>
            Batal
          </button>
          <button
            className="send"
            onClick={() => {
              if (!phone.trim()) return alert("Nomor tidak boleh kosong!");
              onSend(phone);
              setPhone("");
              onClose();
            }}
          >
            Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppDialog;
