import { getPaymentDue, isValidPaymentAmount } from "./invoicePaymentBalance";

const invoice = { total: "250000", total_bayar: "50000", pph23: "0", ppn: "0", harga_paket: "250000" };

test("sisa invoice sama untuk pembayaran penuh dan cicilan", () => {
  expect(getPaymentDue(invoice)).toBe(200000);
  expect(isValidPaymentAmount("200000", 200000)).toBe(true);
  expect(isValidPaymentAmount("50000", 200000)).toBe(true);
  expect(isValidPaymentAmount("200001", 200000)).toBe(false);
  expect(isValidPaymentAmount("", 200000)).toBe(false);
});

test("total lama yang belum mencakup PPN tidak boleh dibayar", () => {
  expect(getPaymentDue({ ...invoice, ppn: "27500" })).toBeNull();
  expect(isValidPaymentAmount("100000", null)).toBe(false);
});
