import { shouldExpireSession } from "./sessionErrors";

test("sesi kedaluwarsa hanya untuk respons autentikasi", () => {
  expect(shouldExpireSession({ response: { status: 401 } })).toBe(true);
  expect(shouldExpireSession({ response: { status: 403, data: { message: "Token tidak valid atau sudah kedaluwarsa." } } })).toBe(true);
  expect(shouldExpireSession({ response: { status: 403, data: { message: "Akses ditolak. Anda tidak memiliki izin yang cukup." } } })).toBe(false);
  expect(shouldExpireSession({ response: { status: 404 } })).toBe(false);
  expect(shouldExpireSession({})).toBe(false);
});
