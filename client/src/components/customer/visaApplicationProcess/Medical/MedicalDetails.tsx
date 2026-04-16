import {
  Box,
  Button,
  Typography,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";

const MedicalDetails = ({
  data,
  phase,
  handleRescheduleRequest,
  onContinue,
}: {
  data: any;
  phase: string;
  handleRescheduleRequest: (reason: string) => Promise<void>;
  onContinue: () => void;
}) => {
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRescheduleOpen = () => {
    setRescheduleOpen(true);
  };

  const handleRescheduleClose = () => {
    setRemarks("");
    setRescheduleOpen(false);
  };

  const handleRescheduleSubmit = async () => {
    if (!remarks.trim()) {
      toast.info("Please provide a reason for rescheduling");
      return;
    }

    try {
      setIsSubmitting(true);
      await handleRescheduleRequest(remarks);
    } catch (error: any) {
      toast.error("Error submitting reschedule request: " + error.message);
    } finally {
      setIsSubmitting(false);
      handleRescheduleClose();
    }
  };

  return (
    <>
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        p={2}
        textAlign="center"
      >
        <Typography my={3} mx={25}>
          We are now processing your UAE residence visa. You will soon receive
          details for your medical test and Emirates ID registration.
        </Typography>

        <Paper
          elevation={2}
          sx={{
            p: 4,
            borderRadius: 4,
            width: "100%",
            maxWidth: 500,
            backgroundColor: "#f9f7f7",
            boxShadow: "none",
          }}
        >
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="subtitle1" fontWeight="bold" mb={2}>
              Medical Test Appointment
            </Typography>
            <Chip
              label={data?.status === "Completed" ? "Completed" : "Scheduled"}
              sx={{
                bgcolor: data?.status === "Completed" ? "#CBE7CB" : "#FFFDEA",
                color: "#3D3D3D",
                fontWeight: "thin",
                fontSize: 13,
                borderRadius: 2,
              }}
            />
          </Box>

          <Box mb={1} display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Date</Typography>
            <Typography>{new Date(data?.date).toLocaleDateString()}</Typography>
          </Box>

          <Box mb={1} display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Time</Typography>
            <Typography>{data?.time}</Typography>
          </Box>

          <Box mb={1} display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Hospital Name</Typography>
            <Typography>{data?.hospitalName}</Typography>
          </Box>
          <Box mb={1} display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Address</Typography>
            <Typography>{data?.address}</Typography>
          </Box>
          <Box mb={1} display="flex" justifyContent="space-between">
            <Typography fontWeight="bold">Contact</Typography>
            <Typography>{data?.contactNumber}</Typography>
          </Box>
        </Paper>

        <Box mt={3} display="flex" gap={2}>
          {data?.status != "Completed" && (
            <Button
              variant="outlined"
              onClick={handleRescheduleOpen}
              sx={{
                color: "black",
                borderColor: "black",
                textTransform: "none",
                borderRadius: "20px",
              }}
            >
              Request Reschedule
            </Button>
          )}{" "}
          {phase === "APPROVED" && (
            <Button
              variant="outlined"
              onClick={onContinue}
              sx={{
                color: "black",
                borderColor: "black",
                textTransform: "none",
                borderRadius: "20px",
              }}
            >
              Continue
            </Button>
          )}
        </Box>
      </Box>

      <Dialog
        open={rescheduleOpen}
        onClose={handleRescheduleClose}
        PaperProps={{ sx: { borderRadius: 10, padding: 2 } }}
      >
        <DialogTitle
          align="center"
          sx={{ fontWeight: "bold", fontSize: "24px" }}
        >
          Request Medical Test Reschedule
        </DialogTitle>

        <DialogContent>
          <DialogContentText align="center">
            If you are unable to attend your scheduled medical test, you can
            request a reschedule. Our team will review your request and provide
            a new appointment date.
          </DialogContentText>

          <TextField
            label="Your Availability*"
            multiline
            minRows={3}
            maxRows={8}
            fullWidth
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            sx={{ mt: 3 }}
            placeholder="Provide your availability or reason for rescheduling"
            variant="outlined"
          />
        </DialogContent>

        <DialogActions>
          <Box display="flex" justifyContent="center" width="100%" gap={2}>
            <Button
              variant="contained"
              onClick={handleRescheduleSubmit}
              disabled={isSubmitting}
              sx={{
                py: 1,
                px: 4,
                minWidth: 270,
                bgcolor: "#F6C328",
                textTransform: "none",
                borderRadius: "15px",
                color: "black",
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Request"}
            </Button>
            <Button
              variant="outlined"
              onClick={handleRescheduleClose}
              disabled={isSubmitting}
              sx={{
                py: 1,
                px: 15,
                color: "black",
                borderColor: "black",
                textTransform: "none",
                borderRadius: "15px",
              }}
            >
              Cancel
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MedicalDetails;
