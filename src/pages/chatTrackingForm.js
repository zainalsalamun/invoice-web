export const isChatTrackingFormValid = (form, canManagePic) =>
    Boolean(form.tanggal && form.deskripsi?.trim() && (!canManagePic || form.nama_pic?.trim()));

export const buildChatTrackingPayload = (form, canManagePic) => canManagePic ? form : {
    tanggal: form.tanggal,
    deskripsi: form.deskripsi,
    progress: form.progress,
    keterangan: form.keterangan,
    nomor_task: form.nomor_task,
};
