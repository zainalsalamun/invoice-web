import { useEffect, useState } from "react";
import { operationalService } from "../services/operationalService";

const storageKey = "ringnet-invoice-report-period";
const savedPeriod = () => {
  try { return sessionStorage.getItem(storageKey) || ""; } catch { return ""; }
};

export const useInvoicePeriod = (initialPeriod) => {
  const [period, setPeriod] = useState(() => initialPeriod ?? savedPeriod());
  const [periods, setPeriods] = useState([]);
  const [periodError, setPeriodError] = useState("");

  useEffect(() => {
    let active = true;
    operationalService.getInvoicePeriods()
      .then((options) => {
        if (!active) return;
        setPeriods(options);
        setPeriod((current) => {
          if (!current || options.some((option) => option.value === current)) return current;
          try { sessionStorage.removeItem(storageKey); } catch { /* Penyimpanan browser opsional. */ }
          return "";
        });
      })
      .catch(() => { if (active) setPeriodError("Daftar periode belum dapat dimuat."); });
    return () => { active = false; };
  }, []);

  const selectPeriod = (value) => {
    try {
      if (value) sessionStorage.setItem(storageKey, value);
      else sessionStorage.removeItem(storageKey);
    } catch { /* Filter tetap berfungsi selama halaman terbuka. */ }
    setPeriod(value);
  };

  return { period, periods, periodError, selectPeriod };
};
