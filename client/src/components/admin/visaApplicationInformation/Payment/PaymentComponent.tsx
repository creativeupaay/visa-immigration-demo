import { useState } from "react";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useFetchPaymentInfoQuery, useSendDubaiPaymentLinkMutation } from "../../../../features/admin/visaApplication/additional/dubaiApis";

type PaymentComponentProps = {
  stepStatusId: string;
};

const PaymentComponent = ({ stepStatusId }: PaymentComponentProps) => {
  const { data, isLoading: isPaymentInfoLoading ,refetch} = useFetchPaymentInfoQuery({ stepStatusId });
  const [sendPaymentLink, { isLoading: isSendPaymentLinkLoading }] = useSendDubaiPaymentLinkMutation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("inr");

  const handleSubmit = async () => {
    if (!amount) return;
    
    try {
      await sendPaymentLink({
        stepStatusId,
        paymentInfo:{
          amount: Number(amount),
          currency
        }
      }).unwrap();
      refetch();
      
      setDialogOpen(false);
      // Reset form
      setAmount("");
      setCurrency("inr");
    } catch (error) {
      console.error("Payment link generation failed:", error);
    }
  };

  const handleOpenInvoice = () => {
    if (data?.data?.invoiceUrl) {
      window.open(data.data.invoiceUrl, "_blank");
    }
  };

  if (isPaymentInfoLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={2}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // No payment data - show Send Payment Link button
  if (!data?.data) {
    return (
      <Box>
        <Button
          onClick={() => setDialogOpen(true)}
          variant="contained"
          sx={{
            bgcolor: "#F6C328",
            color: "black",
            borderRadius: 10,
            textTransform: "none",
            px: 4,
          }}
          disabled={isSendPaymentLinkLoading}
        >
          {isSendPaymentLinkLoading ? <CircularProgress size={24} color="inherit" /> : "Send Payment Link"}
        </Button>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle align="center" fontWeight="bold">
            Enter Payment Details
          </DialogTitle>
          <DialogContent>
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
              >
                <MenuItem value="inr">₹ (INR)</MenuItem>
                <MenuItem value="usd">$ (USD)</MenuItem>
                <MenuItem value="eur">€ (EUR)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              type="number"
              sx={{ mt: 2 }}
            />
          </DialogContent>

          <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
            <Button
              disabled={isSendPaymentLinkLoading}
              onClick={handleSubmit}
              variant="contained"
              sx={{
                bgcolor: "#F6C328",
                color: "black",
                borderRadius: 10,
                textTransform: "none",
                px: 4,
              }}
            >
              {isSendPaymentLinkLoading ? <CircularProgress size={24} color="inherit" /> : "Send"}
            </Button>
            <Button
              onClick={() => setDialogOpen(false)}
              variant="outlined"
              sx={{
                color: "black",
                borderColor: "black",
                borderRadius: 10,
                textTransform: "none",
                px: 4,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  // Payment link sent - show amount
  if (data.data.status === "LINKSENT") {
    return (
      <Box>
        <Typography variant="body1" fontWeight="medium">
          Payment Link Sent: {data.data.currency === "inr" ? "₹" : data.data.currency === "usd" ? "$" : "€"} {data.data.amount}
        </Typography>
      </Box>
    );
  }

  // Payment done - show status and invoice button
  if (data.data.status === "PAID") {
    return (
      <Box display="flex" flexDirection="column" gap={1}>
        <Typography variant="body1" fontWeight="medium" color="green">
          Payment Done: {data.data.currency === "inr" ? "₹" : data.data.currency === "usd" ? "$" : "€"} {data.data.amount}
        </Typography>
        <Button
          onClick={handleOpenInvoice}
          variant="contained"
          sx={{
            bgcolor: "#F6C328",
            color: "black",
            borderRadius: 10,
            textTransform: "none",
            px: 4,
            width:"max-content"
          }}
        >
          View Invoice
        </Button>
      </Box>
    );
  }

  // Default fallback
  return (
    <Box>
      <Typography variant="body1">
        Payment Status: {data.data.status}
      </Typography>
    </Box>
  );
};

export default PaymentComponent;