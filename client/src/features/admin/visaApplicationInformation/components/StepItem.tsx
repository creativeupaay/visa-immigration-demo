import {
  Box,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { Icon } from "@iconify/react/dist/iconify.js";

import { RequirementTypes } from "../visaAppicationInformationTypes";

function areAllRequiredDocsVerified(requirements: any) {
  return requirements
    .filter((req: any) => req.required)
    .every(
      (req: any) => req.reqStatus === "UPLOADED" || req.reqStatus === "VERIFIED"
    );
}

const StepItem = ({
  step,
  index,
  isActive,
  showRequirements,
  onApprove,
  onReject,
  stepStatus,
  currentStepIndex,
  requirements,
  isApproveComplete,
  isRejectComplete
}: {
  step: any;
  index: number;
  isActive: boolean;
  showRequirements: any;
  stepStatus: string;
  onApprove: () => void;
  onReject: () => void;
  currentStepIndex: number;
  requirements: RequirementTypes[];
  isApproveComplete: boolean;
  isRejectComplete:boolean
}) => {
  const isCompleted = index < currentStepIndex;
  // console.log(isApproveComplete);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box display="flex" flexDirection="column" mb={5}>
      <Box
        display="flex"
        flexDirection={{ xs: "row", md: "row" }}
        alignItems={{ xs: "center", md: "center" }}
        gap={{ xs: 1, md: 2 }}
        mb={0}
      >
        {/* Step Indicator */}
        {isCompleted ? (
          <div className="w-8 h-8 bg-golden-yellow-100 text-neutrals-950 rounded-full flex items-center justify-center">
            <Icon icon="icon-park-outline:done-all" width="24" height="24" />
          </div>
        ) : isActive ? (
          <div className="w-fit rounded-full border-[4px] border-golden-yellow-50">
            <div className="rounded-full border-[5px] border-[#FEFCEA]">
              <div className="w-8 h-8 bg-[#FAE081] rounded-full flex items-center justify-center text-black font-bold text-lg">
                {index + 1}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-fit rounded-full border-[4px] border-white">
            <div className="rounded-full border-[5px] border-[#F2F3F3]">
              <div className="w-8 h-8 bg-[#D8D7D4] rounded-full flex items-center justify-center text-black font-bold text-lg">
                {index + 1}
              </div>
            </div>
          </div>
        )}

        {/* Step Label & Actions */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems={{ xs: "flex-start", md: "center" }}
          justifyContent="space-between"
          width="100%"
          gap={2}
        >
          <Typography
            fontWeight={isActive ? "bold" : "medium"}
            color={isActive ? "text.primary" : "grey.500"}
            sx={{
              fontSize: "17px",
            }}
          >
            {step}
          </Typography>

          {/* Action Buttons */}
          {isActive && !isMobile && (
            <Box
              display="flex"
              flexWrap="wrap"
              gap={1.5}
              justifyContent={{ xs: "flex-start", md: "flex-end" }}
            >
              {stepStatus === "APPROVED" ? (
                <>
                  <div className="bg-[#E5F5EC] text-[#1E8E3E] px-6 py-2 rounded-full font-medium">
                    Approved
                  </div>
                  {/* <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      textTransform: "none",
                      borderColor: "#F54337",
                      color: "#F54337",
                      borderRadius: "19px",
                    }}
                    onClick={onReject}
                    disabled={isRejectComplete}
                  >
                    {isRejectComplete ? "Processing" : "Reject"}
                  </Button> */}
                </>
              ) : stepStatus === "REJECTED" ? (
                <>
                  {/* <button
                    onClick={onApprove}
                    className={`px-10 py-2 rounded-4xl ${
                      areAllRequiredDocsVerified(requirements)
                        ? "bg-[#F6C328] text-black cursor-pointer"
                        : "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
                    }`}
                    disabled={!areAllRequiredDocsVerified(requirements)}
                  >
                    Approve
                  </button> */}
                  <div className="bg-[#FEEAED] text-[#F54337] px-6 py-2 rounded-full font-medium">
                    Rejected
                  </div>
                </>
              ) : (
                <>
                  <button
                    onClick={onApprove}
                    className={`
    px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center
    ${
      isApproveComplete
        ? "bg-[#F6C328] text-black opacity-60 cursor-not-allowed"
        : areAllRequiredDocsVerified(requirements)
        ? "bg-[#F6C328] text-black hover:brightness-110 cursor-pointer"
        : "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
    }
  `}
                    disabled={
                      isApproveComplete ||
                      !areAllRequiredDocsVerified(requirements)
                    }
                  >
                    {isApproveComplete ? "Processing..." : "Approve"}{" "}
                  </button>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      textTransform: "none",
                      borderColor: "#F54337",
                      color: "#F54337",
                      borderRadius: "19px",
                    }}
                    onClick={onReject}
                    disabled={isRejectComplete}
                  >
                    {isRejectComplete ? "Processing" : "Reject"}
                  </Button>
                </>
              )}
            </Box>
          )}
        </Box>
      </Box>
      {/* For mobile designs */}
      {isActive && isMobile && (
        <Box
          display="flex"
          flexWrap="wrap"
          gap={1.5}
          justifyContent={{ xs: "flex-start", md: "flex-end" }}
          my={1}
          p={1}
        >
          {stepStatus === "APPROVED" ? (
            <>
              <div className="bg-[#E5F5EC] text-[#1E8E3E] px-6 py-2 rounded-full font-medium">
                Approved
              </div>
              {/* <Button
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  borderColor: "#F54337",
                  color: "#F54337",
                  borderRadius: "19px",
                }}
                onClick={onReject}
              >
                Reject
              </Button> */}
            </>
          ) : stepStatus === "REJECTED" ? (
            <>
              {/* <button
                onClick={onApprove}
                className={`px-10 py-2 rounded-4xl ${
                  areAllRequiredDocsVerified(requirements)
                    ? "bg-[#F6C328] text-black cursor-pointer"
                    : "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
                }`}
                disabled={!areAllRequiredDocsVerified(requirements)}
              >
                Approve
              </button> */}
              <div className="bg-[#FEEAED] text-[#F54337] px-6 py-2 rounded-full font-medium">
                Rejected
              </div>
            </>
          ) : (
            <>
              <button
                onClick={onApprove}
                className={`
    px-6 py-2 rounded-full font-medium transition-all duration-200 flex items-center justify-center
    ${
      isApproveComplete
        ? "bg-[#F6C328] text-black opacity-60 cursor-not-allowed"
        : areAllRequiredDocsVerified(requirements)
        ? "bg-[#F6C328] text-black hover:brightness-110 cursor-pointer"
        : "bg-[#E4E3E3] text-[#7F7E7D] cursor-not-allowed"
    }
  `}
                disabled={
                  isApproveComplete || !areAllRequiredDocsVerified(requirements)
                }
              >
                {isApproveComplete ? "Processing..." : "Approve"}
              </button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  textTransform: "none",
                  borderColor: "#F54337",
                  color: "#F54337",
                  borderRadius: "19px",
                }}
                onClick={onReject}
                disabled={isRejectComplete}
              >
                {isRejectComplete ? "Processing" : "Reject"}
              </Button>
            </>
          )}
        </Box>
      )}

      {/* Requirements Section */}
      {isActive && <Box mt={2}>{showRequirements}</Box>}
    </Box>
  );
};

export default StepItem;
