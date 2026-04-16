import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import { useState } from "react";

interface ExportToExcelButtonProps {
  onDownload?: (startDate: string, endDate: string) => void;
}
const ExportToExcelButton: React.FC<ExportToExcelButtonProps> = ({
  onDownload,
}) => {
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const handleDownload = () => {
    console.log("Exporting from:", startDate, "to", endDate);
    if (onDownload) {
      onDownload(startDate, endDate);
    } else {
      console.warn("No download handler provided");
    }
    setOpen(false);
  };

  return (
    <>
      <Button
        variant="outlined"
        onClick={() => setOpen(true)}
        sx={{
          textTransform: "none",
          color: "black",
          borderColor: "black",
          borderRadius: "4px",
        }}
      >
        Export to Excel
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Select Date Range</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              type="date"
              label="Start Date"
              InputLabelProps={{ shrink: true }}
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                if (endDate && e.target.value > endDate) {
                  setEndDate("");
                }
              }}
              fullWidth
            />
            <TextField
              type="date"
              label="End Date"
              InputLabelProps={{ shrink: true }}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              inputProps={{
                min: startDate, // restrict end date to be >= start date
              }}
              fullWidth
              disabled={!startDate}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpen(false)}
            color="inherit"
            sx={{ textTransform: "none", borderRadius: "15px" }}
          >
            Close
          </Button>
          <Button
            variant="contained"
            onClick={handleDownload}
            disabled={!startDate || !endDate}
            sx={{ textTransform: "none", borderRadius: "15px" }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ExportToExcelButton;
