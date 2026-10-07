import { createPaymentRequestId } from "./paymentRequestId";

test("ID pembayaran baru berupa UUID v4 dan tidak berulang", () => {
  let seed = 0;
  Object.defineProperty(window, "crypto", {
    configurable: true,
    value: { getRandomValues: (bytes) => {
      seed += 1;
      bytes.fill(seed);
      return bytes;
    } },
  });
  const first = createPaymentRequestId();
  const second = createPaymentRequestId();
  expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  expect(second).not.toBe(first);
});
