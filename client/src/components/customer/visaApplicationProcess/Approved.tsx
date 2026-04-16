import { Button, Dialog, DialogTitle, DialogContent, List, ListItem, IconButton, Typography, Box } from "@mui/material";
import LoadingGif from "../../../assets/customer/Rightt.gif";
import { useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const Approved = ({
  stepSource,
  requirementData,
  onContinue,
  currentStepName,
}: {
  stepSource?: string;
  requirementData?: any;
  onContinue: () => void;
  currentStepName: string;
}) => {
  // Get all documents if source is ADMIN and requirementData exists
  const documents =
    stepSource === "ADMIN" && requirementData ? requirementData : [];

  // State for document selection dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Function to open a single document
  const openDocument = (url: string) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  // Function to download a single document
  const downloadDocument = (url: string, name?: string) => {
    if (url) {
      const a = document.createElement("a");
      a.href = url;
      a.download = name || `document-${Math.random().toString(36).substring(7)}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // Check if there's at least one document with a non-falsy value
  const validDocuments = documents.filter((doc: any) => doc?.value);
  const hasValidDocuments = validDocuments.length > 0;
  const validDocumentCount = validDocuments.length;

  // Handle primary button click based on document count
  const handlePrimaryAction = () => {
    if (validDocumentCount === 1) {
      // If only one document, open it directly
      openDocument(validDocuments[0].value);
    } else if (validDocumentCount > 1) {
      // If multiple documents, show selection dialog
      setDialogOpen(true);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center md:mt-24">
      {/* Verified Icon Container */}
      <div className="rounded-full border-[20px] border-golden-yellow-50 w-fit">
        <div className="rounded-full border-[15px] border-[#FEFCEA]">
          <div className="text-neutrals-50 bg-[#FAE081] rounded-full">
            <img className="w-[100px] h-[100px]" src={LoadingGif} />
          </div>
        </div>
      </div>
      
      {/* Verified Message */}
      <p className="mt-4 text-lg">{currentStepName} - Approved</p>

      {/* Document Button - Only show if there's at least one valid document */}
      {hasValidDocuments && (
        <Button
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: "20px",
            marginTop: "12px",
            boxShadow: "none",
          }}
          onClick={handlePrimaryAction}
        >
          {validDocumentCount > 1 ? "View Documents" : "View Document"}
        </Button>
      )}
      
      {/* Continue Button */}
      <Button
        onClick={onContinue}
        variant="outlined"
        sx={{
          borderColor: "black",
          my: 5,
          color: "black",
          borderRadius: "15px",
          textTransform: "none",
          px: 6,
          py: 1,
        }}
      >
        Continue
      </Button>

      {/* Document Selection Dialog for multiple documents */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Available Documents</Typography>
            <IconButton onClick={() => setDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <List>
            {validDocuments.map((doc: any, index: number) => (
              <ListItem 
                key={index}
                sx={{ 
                  border: "1px solid #eee",
                  borderRadius: "8px",
                  mb: 1,
                  p: 2
                }}
              >
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body1" noWrap>
                    {doc.name || `Document ${index + 1}`}
                  </Typography>
                  <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<FileDownloadIcon />}
                      onClick={() => downloadDocument(doc.value, doc.name)}
                      sx={{ textTransform: "none" }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => openDocument(doc.value)}
                      sx={{ textTransform: "none" }}
                    >
                      Open
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approved;