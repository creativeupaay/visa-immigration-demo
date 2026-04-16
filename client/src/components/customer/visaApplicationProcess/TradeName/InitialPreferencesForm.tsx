import { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useSubmitTradeNameOptionsMutation } from "../../../../features/admin/visaApplication/additional/dubaiApis";
import { toast } from "react-toastify";

const InitialPreferencesForm = ({ stepStatusId,refetch }: { stepStatusId: string ,refetch:()=>void}) => {
  const [submitOptions, { isLoading }] = useSubmitTradeNameOptionsMutation();
  const [tradeName, setTradeName] = useState("");
  const [altName1, setAltName1] = useState("");
  const [altName2, setAltName2] = useState("");

  const handleSubmit = async () => {
    if (!tradeName.trim() || !altName1.trim() || !altName2.trim()) {
      toast.info("All trade name fields are required");
      return;
    }

    try {
      const options = [tradeName, altName1, altName2];

      await submitOptions({
        stepStatusId,
        options,
      }).unwrap();

      toast.success("Trade names submitted successfully");
      refetch();
    } catch (error) {
      console.error("Failed to submit trade names:", error);
      toast.error("Failed to submit trade names. Please try again.");
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      p={2}
    >
      <Typography variant="h5" fontWeight="bold" mb={4}>
        Enter your Trade Name
      </Typography>

      <Box width="100%" maxWidth={500}>
        <Typography mb={1}>Trade Name*</Typography>
        <TextField
          fullWidth
          placeholder="Enter Trade Name"
          variant="outlined"
          value={tradeName}
          onChange={(e) => setTradeName(e.target.value)}
          required
          sx={{
            mb: 3,
            backgroundColor: "#F7F5F4",
            borderRadius: 1,
            borderColor: "#0F1EF",
          }}
        />

        <Typography mb={1}>Alternate Trade Name 1*</Typography>
        <TextField
          fullWidth
          placeholder="Enter New Trade Name"
          variant="outlined"
          value={altName1}
          onChange={(e) => setAltName1(e.target.value)}
          required
          sx={{
            mb: 3,
            backgroundColor: "#F7F5F4",
            borderRadius: 1,
            borderColor: "#0F1EF",
          }}
        />

        <Typography mb={1}>Alternate Trade Name 2*</Typography>
        <TextField
          fullWidth
          placeholder="Enter New Trade Name"
          variant="outlined"
          value={altName2}
          onChange={(e) => setAltName2(e.target.value)}
          required
          sx={{
            mb: 4,
            backgroundColor: "#F7F5F4",
            borderRadius: 1,
            borderColor: "#0F1EF",
          }}
        />

        <Box display="flex" justifyContent="center">
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            sx={{
              backgroundColor: "#F6C328",
              color: "#000",
              fontWeight: "light",
              px: 4,
              py: 1,
              borderRadius: "16px",
              textTransform: "none",
              "&:disabled": {
                backgroundColor: "#e0e0e0",
                color: "#9e9e9e",
              },
            }}
          >
            {isLoading ? (
              <>
                <CircularProgress size={20} sx={{ color: "#000", mr: 1 }} />
                Submitting...
              </>
            ) : (
              "Send for Approval"
            )}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InitialPreferencesForm;
