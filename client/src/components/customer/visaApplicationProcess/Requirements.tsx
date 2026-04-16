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
import { useState, useEffect } from "react";
import { canProceedToNextStep } from "../../../pages/customer/dashboard/VisaApplicationProcess";
import UploadComponent from "./UploadComponent";
import UploadModal from "../../UploadModal";
import { useSubmitRequirementsMutation } from "../../../features/common/commonApi";

const Requirements = ({
  phase,
  requirementData,
  stepType,
  stepStatus,
  refetch,
  onSubmit,
}: {
  phase: string;
  requirementData: any;
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

  // API mutation hook
  const [submitRequirements, { isLoading: isSubmittingDropdown }] =
    useSubmitRequirementsMutation();

  // Separate file requirements from dropdown requirements
  const fileRequirements = requirementData.filter(
    (req: any) => req.requirementType !== "DROPDOWN"
  );

  const dropdownRequirements = requirementData.filter(
    (req: any) => req.requirementType === "DROPDOWN"
  );

  // Initialize dropdown values from existing data
  useEffect(() => {
    const initialValues: Record<string, string> = {};
    dropdownRequirements.forEach((req: any) => {
      if (req.value) {
        initialValues[req.reqStatusId] = req.value;
      }
    });
    setDropdownValues(initialValues);
  }, [requirementData]);

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
      .filter((req: any) => req.required)
      .every((req: any) => dropdownValues[req.reqStatusId]);
  };

  if (stepType !== "GENERAL") return null;

  return (
    <>
      {/* File requirements section */}
      <div className="flex flex-col mt-24 overflow-y-auto h-72 custom-scrollbar">
        {phase === "IN_PROGRESS" ? (
          <>
            <p className="text-neutrals-950 text-sm font-semibold">Documents</p>
            {fileRequirements.map((data: any) => (
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
                  {fileRequirements.map((data: any) => (
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
            {dropdownRequirements.map((req: any) => (
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
                  {req.options.map((option: string) => (
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
              canProceedToNextStep(fileRequirements) &&
              areAllRequiredDropdownsFilled()
                ? "bg-[#F6C328] text-black cursor-pointer"
                : "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
            }`}
            disabled={
              !canProceedToNextStep(fileRequirements) ||
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