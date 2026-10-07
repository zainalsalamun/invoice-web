export const shouldExpireSession = (error) => {
  const status = error.response?.status;
  const message = error.response?.data?.message || "";
  return status === 401 || (status === 403 && /token tidak valid atau sudah kedaluwarsa/i.test(message));
};
