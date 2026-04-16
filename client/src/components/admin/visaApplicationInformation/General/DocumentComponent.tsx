import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { Icon } from "@iconify/react/dist/iconify.js";

const DocumentComponent = ({
  reqStatusId,
  fileName,
  fileType,
  fileSize,
  status,
  value,
  onMarkAsVerified,
  onNeedsReUpload,
}: {
  value: string;
  reqStatusId: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  status: string;
  onMarkAsVerified: any;
  onNeedsReUpload: any;
}) => {
  const [reason, setReason] = useState("");

  // const isDisabled = status === "NOT_UPLOADED";
  const [openDialog, setOpenDialog] = useState(false);

  const handleDialogOpen = () => setOpenDialog(true);
  const handleDialogClose = () => setOpenDialog(false);

  const handleConfirmReupload = () => {
    onNeedsReUpload({ reqStatusId, reason });
    setReason("");
    handleDialogClose();
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          borderBottom: "1px solid #eee",
          gap: 2,
        }}
      >
        <Box
          display="flex"
          alignItems="flex-start"
          gap={2}
          width="100%"
          flexDirection={{ xs: "row", sm: "row" }}
        >
          <div
            className={`${
              status === "VERIFIED"
                ? "bg-[#CAE6CB]"
                : status === "UPLOADED"
                ? "bg-golden-yellow-100 text-neutrals-950"
                : "bg-neutrals-200 text-white"
            } p-3 rounded-xl`}
          >
            <Icon
              icon={
                status === "VERIFIED" || status === "UPLOADED"
                  ? "icon-park-outline:done-all"
                  : "icon-park-outline:upload"
              }
              width="24"
              height="24"
            />
          </div>

          <Box>
            <Typography sx={{ fontSize: "14px" }} fontWeight={600}>
              {fileName}
            </Typography>
            <Typography color="text.secondary" sx={{ fontSize: "12px" }}>
              File Format: {fileType} &nbsp;&nbsp; File Size: {fileSize}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons Section */}
        <Box
          display="flex"
          flexWrap={{ xs: "wrap", md: "nowrap" }}
          gap={1}
          mt={{ xs: 1, md: 0 }}
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
          alignItems="center"
        >
          {status !== "NOT_UPLOADED" && (
            <a href={value} target="_blank" rel="noopener noreferrer">
              <Button
                size="small"
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderColor: "#282827",
                  color: "#282827",
                  borderRadius: "12px",
                }}
              >
                Preview
              </Button>
            </a>
          )}

          {status === "VERIFIED" && (
            <Typography
              sx={{
                color: "#64AF64",
                fontWeight: 600,
                fontSize: "14px",
                whiteSpace: "nowrap",
                minWidth: "max-content",
              }}
            >
              Marked as Verified
            </Typography>
          )}

          {status === "UPLOADED" && (
            <>
              <Button
                onClick={() => onMarkAsVerified(reqStatusId)}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  color: "#64AF64",
                  borderColor: "#64AF64",
                  borderRadius: "12px",
                  minWidth: "max-content",
                }}
              >
                Mark as Verified
              </Button>
              <Button
                onClick={handleDialogOpen}
                variant="outlined"
                size="small"
                sx={{
                  textTransform: "none",
                  color: "red",
                  borderColor: "red",
                  borderRadius: "12px",
                  minWidth: "max-content",
                }}
              >
                Needs Re-Upload
              </Button>
            </>
          )}

          {status === "RE_UPLOAD" && (
            <Typography
              sx={{ color: "black", fontWeight: 600, fontSize: "13px" }}
            >
              Sent for Re-Upload
            </Typography>
          )}

          {status === "NOT_UPLOADED" && (
            <>
              <Button
                variant="outlined"
                size="small"
                disabled
                sx={{
                  textTransform: "none",
                  color: "#999",
                  borderColor: "#999",
                  borderRadius: "12px",
                  minWidth: "max-content",
                }}
              >
                Mark as Verified
              </Button>
              <Button
                variant="outlined"
                size="small"
                disabled
                sx={{
                  textTransform: "none",
                  color: "#999",
                  borderColor: "#999",
                  borderRadius: "12px",
                  minWidth: "max-content",
                }}
              >
                Needs Re-Upload
              </Button>
            </>
          )}
        </Box>
      </Paper>

      {/* Dialog code remains same */}
      <Dialog
        open={openDialog}
        onClose={handleDialogClose}
        PaperProps={{ sx: { borderRadius: 10, padding: 2, width: "500px" } }}
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: "center" }}>
          Re-Upload Document
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          <Typography fontWeight={600} sx={{ fontSize: "14px", mb: 1 }}>
            Reason for Re-Upload
          </Typography>
          <TextField
            multiline
            minRows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Admins have to provide a reason for re-upload, which will be sent to the client."
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            onClick={handleConfirmReupload}
            sx={{
              backgroundColor: "#F54337",
              color: "white",
              px: 4,
              borderRadius: "9999px",
            }}
          >
            Send
          </Button>
          <Button
            onClick={handleDialogClose}
            variant="outlined"
            sx={{
              color: "#000",
              borderColor: "#000",
              px: 4,
              borderRadius: "9999px",
            }}
          >
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DocumentComponent;
