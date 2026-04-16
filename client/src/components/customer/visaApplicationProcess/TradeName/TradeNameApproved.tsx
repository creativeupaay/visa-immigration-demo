import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  TextField,
  Typography,
} from "@mui/material";
import LoadingGif from "../../../../assets/customer/Rightt.gif";
import { useRequestTradenameChangeMutation } from "../../../../features/admin/visaApplication/additional/dubaiApis";
import { toast } from "react-toastify";

const TradeNameApproved = ({
  stepStatusId,
  data,
  refetch,
  onContinue,
}: {
  stepStatusId: string;
  data: any;
  refetch: () => void;
  onContinue: () => void;
}) => {
  const [requestChange, { isLoading: isRequestChangeLoading }] =
    useRequestTradenameChangeMutation();

  const [open, setOpen] = useState(false);
  const [confirmAndProceeed, setConfirmAndProceeed] = useState(false);
  const [tradeName, setTradeName] = useState("");
  const [altName1, setAltName1] = useState("");
  const [altName2, setAltName2] = useState("");
  const [reason, setReason] = useState("");
  const [confirmLoading, setConfirmLoading] = useState(false);

  const tradeStatus = useMemo(() => {
    if (data?.data?.status === "TradeName_Assigned") {
      return { message: "Trade Name Assigned", color: "#000000" };
    } else if (data?.data?.status === "ChangeReq_Approved") {
      return { message: "Trade Name Change Approved", color: "#64AF64" };
    } else if (data?.data?.status === "ChangeReq_Rejected") {
      return { message: "Trade Name Change Rejected", color: "#FF0000" };
    }
    return { message: "", color: "#000000" };
  }, [data]);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setTradeName("");
    setAltName1("");
    setAltName2("");
    setReason("");
    setOpen(false);
  };

  const handleSubmit = async () => {
    // Validate that all required fields are filled
    if (!tradeName.trim() || !altName1.trim() || !altName2.trim()) {
      toast.info("All trade name fields are required");
      return;
    }

    try {
      // Create array of options as required by the API
      const options = [tradeName, altName1, altName2];

      // Call the mutation with the required parameters
      const response = await requestChange({
        stepStatusId,
        options,
        reasonOfChange: reason.trim(), // Include reason if provided
      }).unwrap();

      console.log("API Response:", response);

      // Show success message
      toast.success("Trade name change request submitted successfully");

      // Close the dialog
      handleClose();

      // Refetch data as requested
      refetch();
    } catch (error) {
      console.error("Failed to submit trade name change request:", error);

      // Show error message using alert
      toast.error(
        "Failed to submit trade name change request. Please try again."
      );
    }
  };

  const handleContinue = () => {
    setConfirmLoading(true);
    try {
      if (confirmAndProceeed) {
        onContinue();
      } else {
        toast.error("Please confirm the trade name before proceeding.");
      }
    } catch (error) {
      console.error("Error during continue action:", error);
      toast.error("An error occurred while processing your request.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* Verified Icon Container */}
      <div className="rounded-full border-[20px] border-golden-yellow-50 w-fit">
        <div className="rounded-full border-[15px] border-[#FEFCEA]">
          <div className="text-neutrals-50 bg-[#FAE081] rounded-full">
            <img className="w-[90px] h-[90px]" src={LoadingGif} />
          </div>
        </div>
      </div>

      {/* Verified Message */}
      <p className="mt-4 text-lg" style={{ color: tradeStatus.color }}>
        {tradeStatus.message}
      </p>
      <p className="mt-4 text-[20px] font-bold">
        Trade name : {data?.data?.assignedName}
      </p>

      <FormControlLabel
        control={
          <Checkbox
            onChange={(e) => setConfirmAndProceeed(e.target.checked)}
            sx={{
              color: "black",
              "&.Mui-checked": {
                color: "black",
              },
            }}
          />
        }
        label="I confirm this trade name for my business."
      />

      {/* Continue Button */}
      <Button
        onClick={handleContinue}
        disabled={!confirmAndProceeed || confirmLoading}
        sx={{
          backgroundColor:
            !confirmAndProceeed || confirmLoading ? "#E4E3E3" : "#F6C328",
          my: 1,
          color: "black",
          borderRadius: "15px",
          textTransform: "none",
          px: 6,
          py: 1,
        }}
      >
        Confirm & Proceed
      </Button>

      {/* Request Change Trigger */}
      {data?.data?.status === "TradeName_Assigned" && (
        <p className="my-5">
          Is this trade name different from what you expected?{" "}
          <span
            className="font-bold text-[#F6C328] cursor-pointer"
            onClick={handleOpen}
          >
            Request change
          </span>
        </p>
      )}

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle
          align="center"
          sx={{
            fontWeight: "bold",
            fontSize: "24px",
          }}
        >
          Request Trade Name Change
        </DialogTitle>
        <DialogContent>
          <Typography
            align="center"
            sx={{
              fontSize: "16px",
            }}
          >
            Submit your new trade name request. Our team will review
            availability and update your trade license accordingly.
          </Typography>
          <Box width="100%" maxWidth={500}>
            <Typography mb={1}>Trade Name*</Typography>
            <TextField
              fullWidth
              placeholder="Enter Trade Name"
              variant="outlined"
              value={tradeName}
              onChange={(e) => setTradeName(e.target.value)}
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
              sx={{
                mb: 4,
                backgroundColor: "#F7F5F4",
                borderRadius: 1,
                borderColor: "#0F1EF",
              }}
            />
            <Typography mb={1} sx={{ fontWeight: "bold" }}>
              Reason for change
            </Typography>
            <TextField
              fullWidth
              placeholder="You can provide a reason for change."
              variant="outlined"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              sx={{
                mb: 4,
                backgroundColor: "#F7F5F4",
                borderRadius: 1,
                borderColor: "#0F1EF",
              }}
            />
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Button
            onClick={handleSubmit}
            disabled={isRequestChangeLoading}
            sx={{
              backgroundColor: "#F6C328",
              color: "black",
              borderRadius: "15px",
              textTransform: "none",
              px: 6,
              py: 1,
              "&:disabled": {
                backgroundColor: "#E4E3E3",
                color: "#9e9e9e",
              },
            }}
          >
            {isRequestChangeLoading ? "Requesting..." : "Request Change"}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClose}
            disabled={isRequestChangeLoading}
            sx={{
              borderRadius: "15px",
              color: "black",
              textTransform: "none",
              borderColor: "black",
              px: 6,
              py: 1,
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default TradeNameApproved;
