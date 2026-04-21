type OpenMockInvoiceParams = {
  amount?: number | string;
  currency?: string;
  status?: string;
  invoiceId?: string;
  customerName?: string;
  customerEmail?: string;
  source?: string;
};

export const openMockInvoice = ({
  amount,
  currency,
  status,
  invoiceId,
  customerName,
  customerEmail,
  source,
}: OpenMockInvoiceParams = {}): void => {
  const mockInvoiceUrl = new URL(`${window.location.origin}/mock/invoice`);

  if (amount !== undefined && amount !== null && amount !== "") {
    mockInvoiceUrl.searchParams.set("amount", String(amount));
  }

  if (currency) {
    mockInvoiceUrl.searchParams.set("currency", currency);
  }

  if (status) {
    mockInvoiceUrl.searchParams.set("status", status);
  }

  if (invoiceId) {
    mockInvoiceUrl.searchParams.set("invoiceId", invoiceId);
  }

  if (customerName) {
    mockInvoiceUrl.searchParams.set("customerName", customerName);
  }

  if (customerEmail) {
    mockInvoiceUrl.searchParams.set("customerEmail", customerEmail);
  }

  if (source) {
    mockInvoiceUrl.searchParams.set("source", source);
  }

  window.open(mockInvoiceUrl.toString(), "_blank");
};
