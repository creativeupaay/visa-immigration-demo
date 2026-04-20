import { Box, Button } from "@mui/material";
import Logo from "../assets/visaflow-logo.svg";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useProceedToPaymentMutation } from "../features/admin/clientInformation/clientInformationApi";

const ClientPaymentComponent = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [proceedToPayment, { isLoading }] = useProceedToPaymentMutation();

  const handleProceed = async () => {
    try {
      const response = await proceedToPayment({ leadid: leadId }).unwrap();

      if (response?.isMock) {
        toast.success(response?.message || "Mock payment completed successfully.");
        navigate("/login");
        return;
      }

      if (response?.paymentUrl) {
        toast.success("Redirecting to payment...");
        window.open(response.paymentUrl, "_blank");
        return;
      }

      toast.error("Payment URL not available. Please contact support.");
    } catch (error) {
      toast.error("Failed to proceed to payment. Please try again.");
      console.error("Payment error:", error);
    }
  };

  return (
    <Box
      sx={{
        bgcolor: "#292927",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          width: "100%",
          maxWidth: 300,
          px: 2,
        }}
      >
        <img src={Logo} alt="Logo" className="w-[120px] h-[100px] my-5" />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ textTransform: "none", borderRadius: "20px" }}
          onClick={handleProceed}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : "Proceed to payment"}
        </Button>
      </Box>
    </Box>
  );
};

export default ClientPaymentComponent;
