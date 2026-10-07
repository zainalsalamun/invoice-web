import { buildChatTrackingPayload, isChatTrackingFormValid } from "./chatTrackingForm";

const form = {
    nama_pic: "Anggi",
    admin_id: "owner-1",
    tanggal: "2026-10-05",
    deskripsi: "Periksa jaringan",
    progress: "Sedang Diproses",
    keterangan: "Dalam pemeriksaan",
    nomor_task: "TASK-001",
};

test("staf hanya mengirim kolom pekerjaan yang boleh diubah", () => {
    const payload = buildChatTrackingPayload(form, false);
    expect(payload).not.toHaveProperty("nama_pic");
    expect(payload).not.toHaveProperty("admin_id");
    expect(payload.deskripsi).toBe("Periksa jaringan");
});

test("super admin dapat menetapkan PIC dan pemilik tugas", () => {
    expect(buildChatTrackingPayload(form, true)).toEqual(form);
});

test("validasi form memerlukan PIC hanya untuk super admin", () => {
    expect(isChatTrackingFormValid({ ...form, nama_pic: "" }, false)).toBe(true);
    expect(isChatTrackingFormValid({ ...form, nama_pic: "" }, true)).toBe(false);
    expect(isChatTrackingFormValid({ ...form, deskripsi: "  " }, false)).toBe(false);
});
