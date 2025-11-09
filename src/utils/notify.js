// src/utils/notify.js
import { enqueueSnackbar } from "notistack";

/**
 * Menampilkan notifikasi global
 * @param {string} message - Pesan notifikasi
 * @param {"success"|"error"|"warning"|"info"} variant - Tipe notifikasi
 * @param {object} options - Pengaturan tambahan
 */
export const notify = (message, variant = "info", options = {}) => {
  enqueueSnackbar(message, {
    variant,
    anchorOrigin: { vertical: "bottom", horizontal: "right" },
    autoHideDuration: 3000,
    ...options,
  });
};

export const notifySuccess = (msg) => notify(msg, "success");
export const notifyError = (msg) => notify(msg, "error");
export const notifyWarning = (msg) => notify(msg, "warning");
export const notifyInfo = (msg) => notify(msg, "info");
