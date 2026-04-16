import { Box, Button, Typography, CircularProgress } from "@mui/material";
import ProcessComponent from "../ProcessComponent";
import {
  useDubaiProceedToPaymentMutation,
  useFetchPaymentInfoQuery,
} from "../../../../features/admin/visaApplication/additional/dubaiApis";

const PaymentMain = ({
  stepStatusId,
  phase,
  stepData,
  onContinue,
}: {
  stepStatusId: string;
  phase: string;
  stepData: any;
  onContinue: () => void;
}) => {
  const { data, isLoading: isPaymentInfoLoading } = useFetchPaymentInfoQuery({
    stepStatusId,
  });
  const [proceedToPayment] = useDubaiProceedToPaymentMutation();

  const handleProceedToPayment = () => {
    console.log("Proceeding to payment for stepStatusId:", stepStatusId);
    proceedToPayment({ stepStatusId })
      .unwrap()
      .then((response) => {
        const paymetUrl = response?.paymentLink;
        if (paymetUrl) {
          window.open(paymetUrl, "_blank");
        }
      })
      .catch((error) => {
        console.error("Error sending payment link:", error);
      });
  };

  const handleViewInvoice = () => {
    if (data?.data?.invoiceUrl) {
      window.open(data.data.invoiceUrl, "_blank");
    }
  };

  if (isPaymentInfoLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!data?.data) {
    return (
      <ProcessComponent
        label="Processing"
        message={stepData.inProgressMessage}
        date=""
        status=""
      />
    );
  }

  // Display based on payment status
  return (
    <Box p={3}>
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>
        <Typography variant="body1">
          Amount:{" "}
          {data.data.currency === "inr"
            ? "₹"
            : data.data.currency === "usd"
            ? "$"
            : "€"}{" "}
          {data.data.amount}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: getStatusColor(data.data.status) }}
        >
          Status: {formatStatus(data.data.status)}
        </Typography>
      </Box>

      {/* Action buttons based on status */}
      <Box display="flex" gap={2} alignItems={"center"}>
        {data.data.status === "LINKSENT" && (
          <Button
            onClick={handleProceedToPayment}
            variant="contained"
            sx={{
              bgcolor: "#F6C328",
              color: "black",
              borderRadius: 10,
              textTransform: "none",
              px: 4,
            }}
          >
            Proceed to Payment
          </Button>
        )}

        {data.data.status === "PAID" && data.data.invoiceUrl && (
          <Button
            onClick={handleViewInvoice}
            variant="contained"
            sx={{
              bgcolor: "#F6C328",
              color: "black",
              borderRadius: 10,
              textTransform: "none",
              px: 4,
            }}
          >
            View Invoice
          </Button>
        )}

        {data.data.status === "PAID" &&
          (phase === "APPROVED" ? (
            <Button
              onClick={onContinue}
              variant="outlined"
              sx={{
                borderRadius: 10,
                textTransform: "none",
                px: 4,
                color: "black",
                borderColor: "black",
              }}
            >
              Continue
            </Button>
          ) : (
            <Typography>Wait for Admin Approval...</Typography>
          ))}
      </Box>
    </Box>
  );
};

// Helper functions
const formatStatus = (status: string): string => {
  switch (status) {
    case "LINKSENT":
      return "Payment Generated";
    case "PAID":
      return "Payment Completed";
    default:
      return status;
  }
};

const getStatusColor = (status: string): string => {
  switch (status) {
    case "LINKSENT":
      return "#FF9800"; // Orange
    case "PAID":
      return "#4CAF50"; // Green
    default:
      return "inherit";
  }
};

export default PaymentMain;
