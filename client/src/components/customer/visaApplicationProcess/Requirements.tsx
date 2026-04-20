import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
} from "@mui/material";
import { useState, useEffect, useRef, type ChangeEvent } from "react";
import UploadComponent from "./UploadComponent";
import UploadModal from "../../UploadModal";
import {
  useSubmitRequirementsMutation,
  useUploadDocumentMutation,
} from "../../../features/common/commonApi";
import { toast } from "react-toastify";
import { createDemoFile } from "../../../utils/createDemoFile";

interface RequirementItem {
  reqStatusId: string;
  requirementType: string;
  required?: boolean;
  reqStatus: string;
  value?: string;
  options?: string[];
  question?: string;
  reason?: string;
}

const Requirements = ({
  phase,
  requirementData,
  stepType,
  stepStatus,
  refetch,
  onSubmit,
}: {
  phase: string;
  requirementData: RequirementItem[];
  stepType: string;
  stepStatus: string;
  refetch: () => void;
  onSubmit: () => void;
}) => {
  const [reqStatusId, setReqStatusId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [dropdownValues, setDropdownValues] = useState<Record<string, string>>(
    {}
  );
  const uploadAllInputRef = useRef<HTMLInputElement>(null);

  // API mutation hook
  const [submitRequirements, { isLoading: isSubmittingDropdown }] =
    useSubmitRequirementsMutation();
  const [uploadDocument, { isLoading: isUploadingAll }] =
    useUploadDocumentMutation();

  // Separate file requirements from dropdown requirements
  const fileRequirements = requirementData.filter(
    (req) => req.requirementType !== "DROPDOWN"
  );

  const dropdownRequirements = requirementData.filter(
    (req) => req.requirementType === "DROPDOWN"
  );

  const pendingFileRequirements = fileRequirements.filter(
    (req) => req.reqStatus === "NOT_UPLOADED" || req.reqStatus === "RE_UPLOAD"
  );

  // Initialize dropdown values from existing data
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    dropdownRequirements.forEach((req) => {
      if (req.value) {
        initialValues[req.reqStatusId] = req.value;
      }
    });
    setDropdownValues(initialValues);
  }, [dropdownRequirements]);

  // Submit dropdown value immediately when changed
  const handleDropdownChange = async (reqStatusId: string, value: string) => {
    try {
      // Update local state
      setDropdownValues((prev) => ({
        ...prev,
        [reqStatusId]: value,
      }));

      // Submit to API immediately
      await submitRequirements([{ reqStatusId, value }]).unwrap();

      // Refresh data after successful submission
      refetch();
    } catch (error) {
      console.error("Error submitting dropdown value:", error);
      // Optionally handle error (show notification, etc.)
    }
  };

  // Check if all required dropdown values are filled
  const areAllRequiredDropdownsFilled = () => {
    return dropdownRequirements
      .filter((req) => req.required)
      .every((req) => dropdownValues[req.reqStatusId]);
  };

  const areAllRequiredFilesUploaded = () => {
    return fileRequirements
      .filter((req) => req.required)
      .every((req) => req.reqStatus === "UPLOADED" || req.reqStatus === "VERIFIED");
  };

  const uploadFileToPendingRequirements = async (file: File) => {
    if (pendingFileRequirements.length === 0) {
      toast.info("All documents are already uploaded.");
      return;
    }

    let successCount = 0;
    let failedCount = 0;

    for (const req of pendingFileRequirements) {
      try {
        await uploadDocument({ reqStatusId: req.reqStatusId, file }).unwrap();
        successCount += 1;
      } catch (error) {
        failedCount += 1;
        console.error("Upload failed for requirement", req.reqStatusId, error);
      }
    }

    if (successCount > 0) {
      toast.success(`Uploaded ${successCount} document(s) successfully.`);
      refetch();
    }

    if (failedCount > 0) {
      toast.error(`${failedCount} document(s) failed to upload. Please retry.`);
    }
  };

  const handleUploadAllFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) return;

    await uploadFileToPendingRequirements(file);
  };

  const handleUseDemoFileForAll = async () => {
    const demoFile = createDemoFile("visaflow-sample-bulk-upload.pdf");
    await uploadFileToPendingRequirements(demoFile);
  };

  if (stepType !== "GENERAL") return null;

  return (
    <>
      {/* File requirements section */}
      <div className="flex flex-col mt-24 overflow-y-auto h-72 custom-scrollbar">
        {phase === "IN_PROGRESS" ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <p className="text-neutrals-950 text-sm font-semibold">Documents</p>
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <input
                  type="file"
                  ref={uploadAllInputRef}
                  accept="application/pdf,image/jpeg,image/png"
                  className="hidden"
                  onChange={handleUploadAllFiles}
                />
                <button
                  type="button"
                  onClick={handleUseDemoFileForAll}
                  disabled={pendingFileRequirements.length === 0 || isUploadingAll}
                  className={`py-1.5 px-4 text-sm rounded-xl whitespace-nowrap border ${
                    pendingFileRequirements.length === 0 || isUploadingAll
                      ? "bg-[#F5F5F5] border-[#E4E3E3] text-[#A2A2A2] cursor-not-allowed"
                      : "bg-white border-[#726D68] text-[#37332f] cursor-pointer"
                  }`}
                >
                  {isUploadingAll ? "Uploading..." : "Use Sample File For All"}
                </button>
                <button
                  type="button"
                  onClick={() => uploadAllInputRef.current?.click()}
                  disabled={pendingFileRequirements.length === 0 || isUploadingAll}
                  className={`py-1.5 px-4 text-sm rounded-xl whitespace-nowrap ${
                    pendingFileRequirements.length === 0 || isUploadingAll
                      ? "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
                      : "bg-[#F6C328] text-neutrals-950 cursor-pointer"
                  }`}
                >
                  {isUploadingAll ? "Uploading All..." : "Upload All"}
                </button>
              </div>
            </div>
            {fileRequirements.map((data) => (
              <div key={data.reqStatusId} className="mt-4">
                <UploadComponent d={data} phase={phase} refetch={refetch} />
              </div>
            ))}
          </>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell width="50%">
                      <Typography variant="body2" fontWeight={600}>
                        Documents
                      </Typography>
                    </TableCell>
                    <TableCell width="15%">
                      <Typography variant="body2" fontWeight={600}>
                        Status
                      </Typography>
                    </TableCell>
                    <TableCell width="25%">
                      <Typography variant="body2" fontWeight={600}>
                        Remarks
                      </Typography>
                    </TableCell>
                    <TableCell width="30%" sx={{ textAlign: "center" }}>
                      <Typography variant="body2" fontWeight={600}>
                        Action
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fileRequirements.map((data) => (
                    <TableRow key={data.reqStatusId}>
                      <TableCell>
                        <UploadComponent
                          d={data}
                          phase={phase}
                          refetch={refetch}
                        />
                      </TableCell>
                      <TableCell>
                        {data.reqStatus === "VERIFIED" ? (
                          <Typography
                            sx={{
                              color: "#65AE64",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            • Approved
                          </Typography>
                        ) : data.reqStatus === "UPLOADED" ? (
                          <Typography
                            sx={{
                              color: "#8D8982",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            • Pending
                          </Typography>
                        ) : data.reqStatus === "RE_UPLOAD" ||
                          data.reqStatus === "NOT_UPLOADED" ? (
                          <Typography
                            sx={{
                              color: "#F54236",
                              fontSize: "14px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            • Needs Re-Upload
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>{data.reason}</TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            gap: 1,
                          }}
                        >
                          {(data.reqStatus === "RE_UPLOAD" ||
                            data.reqStatus === "NOT_UPLOADED") && (
                            <button
                              className="bg-transparent border border-neutrals-400 py-1 px-3 text-neutrals-400 text-sm rounded-xl cursor-pointer whitespace-nowrap"
                              onClick={() => {
                                setReqStatusId(data.reqStatusId);
                                setIsUploadModalOpen(true);
                              }}
                            >
                              Re-Upload
                            </button>
                          )}
                          <button className="bg-[#F6C328] py-1 px-3 text-neutrals-950 text-sm rounded-xl cursor-pointer whitespace-nowrap">
                            Preview
                          </button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {reqStatusId && (
              <UploadModal
                isUploadModalOpen={isUploadModalOpen}
                setIsUploadModalOpen={setIsUploadModalOpen}
                reqStatusId={reqStatusId}
                refetch={refetch}
              />
            )}
          </>
        )}
      </div>

      {/* Dropdown requirements section - directly after file requirements without separation */}
      {dropdownRequirements.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dropdownRequirements.map((req) => (
              <FormControl
                key={req.reqStatusId}
                fullWidth
                required={req.required}
                error={
                  req.required &&
                  !dropdownValues[req.reqStatusId] &&
                  req.reqStatus === "NOT_UPLOADED"
                }
                size="small"
                margin="dense"
              >
                <InputLabel id={`dropdown-label-${req.reqStatusId}`}>
                  {req.question}
                </InputLabel>
                <Select
                  labelId={`dropdown-label-${req.reqStatusId}`}
                  id={`dropdown-${req.reqStatusId}`}
                  value={dropdownValues[req.reqStatusId] || ""}
                  label={req.question}
                  onChange={(e) =>
                    handleDropdownChange(req.reqStatusId, e.target.value)
                  }
                  disabled={
                     phase==="SUBMITTED" || req.reqStatus === "VERIFIED" || isSubmittingDropdown
                  }
                >
                  {(req.options || []).map((option: string) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {req.reason && (
                  <FormHelperText error>{req.reason}</FormHelperText>
                )}
                {req.reqStatus === "VERIFIED" && (
                  <FormHelperText sx={{ color: "#65AE64" }}>
                    • Approved
                  </FormHelperText>
                )}
              </FormControl>
            ))}
          </div>
        </div>
      )}

      {/* Single Submit button for all requirements */}
      <div className="flex justify-start mx-12 md:mx-2 mt-6">
        {stepStatus !== "SUBMITTED" && (
          <button
            onClick={onSubmit}
            className={`px-10 py-2 rounded-4xl ${
              areAllRequiredFilesUploaded() && areAllRequiredDropdownsFilled()
                ? "bg-[#F6C328] text-black cursor-pointer"
                : "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
            }`}
            disabled={
              !areAllRequiredFilesUploaded() ||
              !areAllRequiredDropdownsFilled() ||
              isSubmittingDropdown
            }
          >
            Submit Documents
          </button>
        )}
      </div>
    </>
  );
};

export default Requirements;