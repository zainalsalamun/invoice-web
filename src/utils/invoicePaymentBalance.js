export const getPaymentDue = (invoice) => {
  if (!invoice) return null;
  const total = Number(invoice.total);
  const paid = Number(invoice.total_bayar || 0);
  const withheld = Number(invoice.pph23 || 0);
  const vat = Number(invoice.ppn || 0);
  const base = Number(invoice.harga_paket || 0);
  if (![total, paid, withheld, vat, base].every(Number.isFinite) ||
      total <= 0 || paid < 0 || withheld < 0 || vat < 0 ||
      (vat > 0 && Math.abs(total - base) < 0.01)) return null;
  const remaining = Math.round((total - paid - withheld) * 100) / 100;
  return remaining < 0 ? null : remaining;
};

export const isValidPaymentAmount = (value, due) => {
  if (value === "" || due === null || !Number.isFinite(due)) return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 && amount <= due &&
    Math.abs(Math.round(amount * 100) - amount * 100) <= 0.000001;
};
