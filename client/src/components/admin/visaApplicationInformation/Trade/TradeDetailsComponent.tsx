import {
  Box,
  Button,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Radio,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  useApproveChangeRequestMutation,
  useAssignOneTradenameMutation,
  useFetchTradeInfoQuery,
  useRejectChangeRequestMutation,
} from "../../../../features/admin/visaApplication/additional/dubaiApis";
import { toast } from "react-toastify";

const TradeDetailsComponent = ({ stepStatusId }: { stepStatusId: string }) => {
  const { data, isLoading, refetch } = useFetchTradeInfoQuery({ stepStatusId });
  const [assignOneTradename, { isLoading: assignTradenameLoading }] =
    useAssignOneTradenameMutation();

  const [approveChangeRequest, { isLoading: approveChangeRequestLoading }] = 
    useApproveChangeRequestMutation();
  
  const [rejectChangeRequest, { isLoading: rejectChangeRequestLoading }] = 
    useRejectChangeRequestMutation();

  const [tradeName, setTradeName] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [otherTradeName, setOtherTradeName] = useState("");
  const [selectedOption, setSelectedOption] = useState("");
  const [useCustomName, setUseCustomName] = useState(false);

  useEffect(() => {
    if (data?.data?.assignedName) {
      setTradeName(data?.data?.assignedName);
    }
  }, [data]);


  const handleOpenModal = () => {
    setOpenModal(true);
    // Reset values when opening modal
    setSelectedOption("");
    setOtherTradeName("");
    setUseCustomName(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAssignTradename = async () => {
    if (!tradeName.trim()) {
      toast.info("Please enter a trade name");
      return;
    }
    
    try {
      await assignOneTradename({
        stepStatusId,
        assignedName: tradeName,
      }).unwrap();
      toast.success("Trade Name Assigned Successfully");
      refetch();
    } catch (error) {
      console.error("Failed to assign trade name:", error);
      toast.error("Failed to assign trade name. Please try again.");
    }
  };

  const handleApprove = async () => {
    // Determine which name to use - either selected from options or custom name
    let nameToApprove = useCustomName ? otherTradeName : selectedOption;
    
    if (!nameToApprove.trim()) {
      toast.info("Please select a trade name or enter a custom one");
      return;
    }
    
    try {
      await approveChangeRequest({
        stepStatusId,
        assignedName: nameToApprove
      }).unwrap();
      
      toast.success("Trade name change request approved successfully");
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error("Failed to approve trade name change:", error);
      toast.error("Failed to approve trade name change. Please try again.");
    }
  };
  
  const handleReject = async () => {
    try {
      await rejectChangeRequest({
        stepStatusId
      }).unwrap();
      
      toast.success("Trade name change request rejected");
      handleCloseModal();
      refetch();
    } catch (error) {
      console.error("Failed to reject trade name change:", error);
      toast.error("Failed to reject trade name change. Please try again.");
    }
  };

  const handleOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);
    setUseCustomName(false);
  };

  const handleOtherNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOtherTradeName(e.target.value);
    setUseCustomName(true);
    setSelectedOption("");
  };

  if (isLoading) {
    return <CircularProgress />;
  } else if (!data?.data) {
    return <>Not Submitted Yet</>;
  }
  
  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Red alert message */}
      {data?.data?.status === "ChangeReq_Sent" && (
        <Box display="flex" alignItems="center" gap={1} color="red" mb={3}>
          <Typography sx={{ fontWeight: "bold" }}>❗</Typography>
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={handleOpenModal}
          >
            Client requested for a Trade Name Change. Click here to View.
          </Typography>
        </Box>
      )}

      {/* Existing Trade Name Preferences */}
      {data?.data?.options?.map((option: string, index: number) => (
        <Typography key={index} sx={{ my: 1 }}>
          Trade Name Preference {index + 1}: {option}
        </Typography>
      ))}
      
      {/* Input + Submit */}
      <Box mt={2} display="flex" gap={2} alignItems="center">
        <TextField
          label="Trade Name"
          required
          placeholder="Enter Trade Name"
          value={tradeName}
          onChange={(e) => setTradeName(e.target.value)}
          fullWidth
          variant="outlined"
        />
        <Button
          variant="outlined"
          disabled={assignTradenameLoading}
          onClick={handleAssignTradename}
          sx={{
            borderColor: "black",
            color: "black",
            textTransform: "none",
            borderRadius: "20px",
            py: 1,
            px: 3,
          }}
        >
          {assignTradenameLoading ? "Submitting..." : "Submit"}
        </Button>
      </Box>

      {/* Modal Dialog */}
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: "bold" }}>
          Trade Name Change Request
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Client has requested for a Trade Name Change.
          </Typography>

          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Reason for Change
          </Typography>
          <Typography sx={{ mb: 3, color: "text.secondary" }}>
            {data?.data?.reasonOfChange || "No reason provided"}
          </Typography>

          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Select one of the Trade Names to Approve:
          </Typography>

          <RadioGroup 
            value={selectedOption} 
            onChange={handleOptionChange}
            sx={{ mb: 2 }}
          >
            {data?.data?.options?.map((option: string, index: number) => (
              <FormControlLabel 
                key={index} 
                value={option} 
                control={<Radio />} 
                label={`Trade Name Preference ${index + 1}: ${option}`} 
              />
            ))}
          </RadioGroup>

          <Typography sx={{ fontWeight: "bold", mb: 1 }}>
            Or suggest a different Trade Name:
          </Typography>
          <TextField
            placeholder="Enter new Trade Name"
            value={otherTradeName}
            onChange={handleOtherNameChange}
            fullWidth
            sx={{ mt: 1 }}
          />
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleApprove}
            variant="contained"
            disabled={approveChangeRequestLoading || rejectChangeRequestLoading}
            sx={{
              backgroundColor: "#FFC107",
              color: "black",
              textTransform: "none",
              borderRadius: "20px",
              "&:hover": { backgroundColor: "#FFB300" },
              "&:disabled": { backgroundColor: "#E0E0E0" }
            }}
          >
            {approveChangeRequestLoading ? "Approving..." : "Approve Request"}
          </Button>
          <Button
            onClick={handleReject}
            variant="outlined"
            disabled={approveChangeRequestLoading || rejectChangeRequestLoading}
            sx={{
              borderColor: "#F44336",
              color: "#F44336",
              textTransform: "none",
              borderRadius: "20px",
              "&:disabled": { borderColor: "#E0E0E0", color: "#A0A0A0" }
            }}
          >
            {rejectChangeRequestLoading ? "Rejecting..." : "Reject Request"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TradeDetailsComponent;