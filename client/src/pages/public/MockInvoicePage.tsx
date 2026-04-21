import { Box, Button, Divider, Paper, Stack, Typography } from "@mui/material";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

type InvoiceLineItem = {
  name: string;
  quantity: number;
  unitPrice: number;
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  inr: "₹",
  usd: "$",
  eur: "€",
};

const formatCurrencyAmount = (amount: number, currency: string): string => {
  const normalizedCurrency = currency.toLowerCase();

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    const fallbackSymbol = CURRENCY_SYMBOLS[normalizedCurrency] || "";
    return `${fallbackSymbol}${amount.toFixed(2)}`;
  }
};

const MockInvoicePage = () => {
  const [searchParams] = useSearchParams();

  const amountFromQuery = Number(searchParams.get("amount"));
  const amount = Number.isFinite(amountFromQuery) && amountFromQuery > 0 ? amountFromQuery : 12500;
  const currency = (searchParams.get("currency") || "usd").toLowerCase();
  const status = (searchParams.get("status") || "PAID").toUpperCase();
  const invoiceId = searchParams.get("invoiceId") || `INV-${Date.now().toString().slice(-8)}`;
  const customerName = searchParams.get("customerName") || "Demo Customer";
  const customerEmail = searchParams.get("customerEmail") || "customer.demo@visaflow.io";
  const source = searchParams.get("source") || "VisaFlow Demo";

  const invoiceDate = new Date();
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(invoiceDate.getDate() + 7);

  const lineItems = useMemo<InvoiceLineItem[]>(() => {
    return [
      {
        name: "Visa Processing Service",
        quantity: 1,
        unitPrice: amount * 0.55,
      },
      {
        name: "Document Verification",
        quantity: 1,
        unitPrice: amount * 0.25,
      },
      {
        name: "Advisory & Coordination",
        quantity: 1,
        unitPrice: amount * 0.2,
      },
    ];
  }, [amount]);

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const total = subtotal;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        py: { xs: 3, md: 6 },
        px: { xs: 2, md: 4 },
        background: "linear-gradient(135deg, #f6f3eb 0%, #fff8df 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 920,
          mx: "auto",
          borderRadius: 4,
          border: "1px solid #E6DFCD",
          overflow: "hidden",
        }}
      >
        <Box sx={{ p: { xs: 3, md: 5 }, backgroundColor: "#111827", color: "#F8FAFC" }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={800}>
                VisaFlow
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Mock Invoice Preview for Demo
              </Typography>
            </Box>
            <Box textAlign={{ xs: "left", sm: "right" }}>
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                Invoice ID
              </Typography>
              <Typography variant="h6" fontWeight={700}>
                {invoiceId}
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box sx={{ p: { xs: 3, md: 5 } }}>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" gap={3}>
            <Box>
              <Typography fontWeight={700}>Billed To</Typography>
              <Typography>{customerName}</Typography>
              <Typography color="text.secondary">{customerEmail}</Typography>
              <Typography color="text.secondary">Source: {source}</Typography>
            </Box>
            <Box textAlign={{ xs: "left", md: "right" }}>
              <Typography>
                <strong>Invoice Date:</strong> {invoiceDate.toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Due Date:</strong> {dueDate.toLocaleDateString()}
              </Typography>
              <Typography>
                <strong>Status:</strong> {status}
              </Typography>
            </Box>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 1, fontWeight: 700, mb: 1 }}>
            <Typography variant="body2">Description</Typography>
            <Typography variant="body2" textAlign="center">Qty</Typography>
            <Typography variant="body2" textAlign="right">Unit Price</Typography>
            <Typography variant="body2" textAlign="right">Amount</Typography>
          </Box>

          <Stack spacing={1.2}>
            {lineItems.map((item) => {
              const rowAmount = item.quantity * item.unitPrice;

              return (
                <Box
                  key={item.name}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: "2fr 1fr 1fr 1fr",
                    gap: 1,
                    alignItems: "center",
                    py: 1,
                    borderBottom: "1px dashed #D9D9D9",
                  }}
                >
                  <Typography>{item.name}</Typography>
                  <Typography textAlign="center">{item.quantity}</Typography>
                  <Typography textAlign="right">
                    {formatCurrencyAmount(item.unitPrice, currency)}
                  </Typography>
                  <Typography textAlign="right" fontWeight={600}>
                    {formatCurrencyAmount(rowAmount, currency)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>

          <Stack spacing={1} sx={{ mt: 3, ml: "auto", maxWidth: 320 }}>
            <Stack direction="row" justifyContent="space-between">
              <Typography color="text.secondary">Subtotal</Typography>
              <Typography>{formatCurrencyAmount(subtotal, currency)}</Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6" fontWeight={800}>Total</Typography>
              <Typography variant="h6" fontWeight={800}>
                {formatCurrencyAmount(total, currency)}
              </Typography>
            </Stack>
          </Stack>

          <Typography variant="caption" display="block" sx={{ mt: 4, color: "text.secondary" }}>
            This is a demo-only mock invoice generated for product walkthrough and presentation.
          </Typography>

          <Button
            onClick={() => window.print()}
            variant="contained"
            sx={{
              mt: 2,
              bgcolor: "#F6C328",
              color: "black",
              textTransform: "none",
              borderRadius: 999,
              px: 3,
              "&:hover": { bgcolor: "#E5B820" },
            }}
          >
            Print Invoice
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default MockInvoicePage;
