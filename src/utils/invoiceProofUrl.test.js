jest.mock("./apiClient", () => ({ defaults: { baseURL: "http://127.0.0.1:2102/api" } }));

import { getInvoiceProofUrl } from "./invoiceProofUrl";

test("URL bukti memakai backend lokal dan folder invoice yang benar", () => {
  expect(getInvoiceProofUrl("bukti-123.pdf")).toBe("http://127.0.0.1:2102/uploads/invoices/bukti-123.pdf");
  expect(getInvoiceProofUrl("/uploads/invoices/bukti-123.pdf")).toBe("http://127.0.0.1:2102/uploads/invoices/bukti-123.pdf");
  expect(getInvoiceProofUrl("bukti-123.pdf", "/api")).toBe("/uploads/invoices/bukti-123.pdf");
});
