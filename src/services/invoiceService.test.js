import apiClient from "../utils/apiClient";
import { invoiceService } from "./invoiceService";

jest.mock("../utils/apiClient", () => ({ post: jest.fn(), get: jest.fn() }));

test("konfirmasi pembayaran hanya mengirim nominal aktual, bukan status atau sisa tagihan", async () => {
  apiClient.post.mockResolvedValue({ data: { success: true } });

  await invoiceService.confirmPayment("invoice-1", {
    jumlah_bayar: 50000,
    request_id: "7f1cad8c-21af-4e0b-b55c-9d913e09ad31",
    tanggal_pembayaran: "2026-10-05",
    metode_pembayaran_id: "metode-1",
  });

  const [url, formData] = apiClient.post.mock.calls[0];
  expect(url).toBe("/invoices/invoice-1/confirm");
  expect(formData.get("jumlah_bayar")).toBe("50000");
  expect(formData.get("request_id")).toBe("7f1cad8c-21af-4e0b-b55c-9d913e09ad31");
  expect(formData.get("status_pembayaran")).toBeNull();
  expect(formData.get("kurang_bayar")).toBeNull();
});

test("riwayat pembayaran diminta untuk invoice yang dipilih", async () => {
  apiClient.get.mockResolvedValue({ data: { data: [{ id: "payment-1" }] } });
  await expect(invoiceService.getPayments("invoice-1")).resolves.toEqual([{ id: "payment-1" }]);
  expect(apiClient.get).toHaveBeenCalledWith("/invoices/invoice-1/payments");
});

test("pembatalan mengirim alasan ke transaksi invoice yang tepat", async () => {
  apiClient.post.mockResolvedValue({ data: { success: true } });
  await invoiceService.voidPayment("invoice-1", "payment-1", "Nominal salah input");
  expect(apiClient.post).toHaveBeenCalledWith(
    "/invoices/invoice-1/payments/payment-1/void",
    { reason: "Nominal salah input" }
  );
});
