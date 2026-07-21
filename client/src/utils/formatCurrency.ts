export const formatCurrency = (value: number, currency = "ZAR") =>
  new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
