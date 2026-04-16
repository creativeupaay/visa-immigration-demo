import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@mui/material";
import Invoice_Image from "../../../assets/Admin/Invoice_Image.jpeg";
import { PaymentInfoTypes } from "../../../features/admin/clientInformation/clientInformationTypes";
import { useSendPaymentLinkMutation } from "../../../features/admin/clientInformation/clientInformationApi";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

// Define visa pricing structure types
interface PricingInfo {
  amount: string;
  currency: string;
}

interface VisaPricingType {
  [key: string]: PricingInfo;
}

// Define visa pricing structure
const visaPricing: VisaPricingType = {
  "Grenada": { amount: "25000", currency: "usd" },
  "Dominica": { amount: "20000", currency: "usd" },
  "Dubai": { amount: "7000", currency: "usd" },
  "Portugal": { amount: "12000", currency: "eur" }
};

const PaymentAndInvoiceManagement = ({
  paymentInfo,
  onRefreshLead,
  visaType
}: {
  paymentInfo: PaymentInfoTypes;
  onRefreshLead: () => void;
  visaType: string;
}) => {
  const { leadid } = useParams<{ leadid: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [amount, setAmount] = useState("100");
  const [currency, setCurrency] = useState("inr");
  const [loading, setLoading] = useState(false);

  const [sendPaymentLink] = useSendPaymentLinkMutation();

  // Set default amount and currency based on visa type when component mounts or visaType changes
  useEffect(() => {
    if (visaType && visaPricing[visaType]) {
      setAmount(visaPricing[visaType].amount);
      setCurrency(visaPricing[visaType].currency);
    }
  }, [visaType]);

  const handleSendPaymentLink = async () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0 || !currency) {
      toast.success("Please enter a valid amount and select a currency.");
      return;
    }

    setLoading(true);
    try {
      const body = {
        currency,
        amount: Number(amount),
      };

      const data = await sendPaymentLink({ leadid, body }).unwrap();
      if (data.success === true) {
        toast.success("Payment link sent");
        onRefreshLead();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      console.log(error);
      toast.error("An error occurred while sending the payment link.");
    } finally {
      setLoading(false);
      setDialogOpen(false);
    }
  };

  // Format currency symbol
  const getCurrencySymbol = (currencyCode: string): string => {
    switch(currencyCode) {
      case 'usd': return '$';
      case 'eur': return '€';
      case 'inr': return '₹';
      default: return currencyCode.toUpperCase();
    }
  };

  // Get default pricing display
  const getDefaultPriceDisplay = () => {
    if (visaType && visaPricing[visaType]) {
      const { amount, currency } = visaPricing[visaType];
      return `${getCurrencySymbol(currency)}${amount}`;
    }
    return "Contact for pricing";
  };

  return (
    <div className="p-3 md:p-0">
      <Box mb={2}>
        <Typography variant="subtitle1" fontWeight="bold">
          Default Price : {getDefaultPriceDisplay()}
          {/* for {visaType || "Selected Service"}: {getDefaultPriceDisplay()} */}
        </Typography>
      </Box>

      <Typography>
        {paymentInfo?.method
          ? `Payment Method: ${paymentInfo?.method}`
          : `Send Payment Link:`}
      </Typography>

      {paymentInfo?.status !== "PAID" && (
        <Button
          onClick={() => setDialogOpen(true)}
          sx={{
            p: 1.2,
            bgcolor: "#F6C328",
            color: "black",
            borderRadius: "15px",
            mt: 2,
            textTransform: "none",
            "&:disabled": {
              bgcolor: "#e0e0e0",
              color: "gray",
            },
          }}
        >
          Send Payment Link
        </Button>
      )}

      {paymentInfo?.status === "PAID" ? (
        <Box>
          <img src={Invoice_Image} className="w-[168px] h-[93px] my-3" alt="Invoice" />
          <Typography sx={{ mt: 2 }}>
            Invoice:{" "}
            <a
              href={paymentInfo?.invoice}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#F8CC51",
                textDecoration: "underline",
                fontWeight: "bold",
              }}
            >
              View Invoice
            </a>
          </Typography>
        </Box>
      ) : (
        <>
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
                disabled={loading}
                onClick={handleSendPaymentLink}
                variant="contained"
                sx={{
                  bgcolor: "#F6C328",
                  color: "black",
                  borderRadius: 10,
                  textTransform: "none",
                  px: 4,
                }}
              >
                {loading ? "Sending..." : "Send"}
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
        </>
      )}
    </div>
  );
};

export default PaymentAndInvoiceManagement;