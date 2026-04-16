import { Box, CircularProgress } from "@mui/material";
import StepItem from "./StepItem";
import RequirementList from "./RequirementList";
import { useApproveStepMutation, useMarkAsVerifiedMutation, useNeedsReUploadMutation, useRejectStepMutation } from "../visaApplicationInformationApi";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { StepData } from "../visaAppicationInformationTypes";
import { useGetCurrentStepInfoQuery } from "../../../common/commonApi";
import { toast } from "react-toastify";

interface CommonInfo {
  visaTypeName: string;
  currentStepName: string;
  totalSteps: number;
  currentStepNumber: number;
  stepNames: string[];
}

const ApplicationProcess = () => {
  const { visaApplicationId } = useParams();
  const [stepData, setStepData] = useState<StepData>();
  const [commonInfo, setCommonInfo] = useState<CommonInfo>({
    visaTypeName: "",
    currentStepName: "",
    totalSteps: 0,
    currentStepNumber: 0,
    stepNames: []
  });

  const { data, error, isLoading, refetch } = useGetCurrentStepInfoQuery(visaApplicationId);
  const [approveStep,{isLoading:isApproveComplete}] = useApproveStepMutation();
  const [markAsVerified,{isLoading:isRejectComplete}] = useMarkAsVerifiedMutation();
  const [rejectStep] = useRejectStepMutation();
  const [needsReUpload] = useNeedsReUploadMutation();

  useEffect(() => {
    // console.log(data)
    if (error) {
      console.error("Failed to fetch step info:", error);
    }

    if (!isLoading && data) {
      setStepData(data.stepData);
      
      // Set the common info from the API response
      if (data.commonInfo) {
        setCommonInfo(data.commonInfo);
      }
    }
  }, [error, isLoading, data]);

  const handleApprove = async () => {
    try {
      const response = await approveStep(visaApplicationId).unwrap();
      console.log("Approved", response);
      toast.success("Approved Step");
      refetch();
    } catch (error) {
      console.error("Approval failed", error);
    }
  };

  const handleReject = async () => {
    try {
      const response = await rejectStep(visaApplicationId).unwrap();
      console.log("Rejected", response);
      toast.error("Rejected the Step");
      refetch();
    } catch (error) {
      console.error("Rejection failed", error);
    }
  };

  const handleMarkAsVerified = async (reqStatusId: string) => {
    try {
      console.log(reqStatusId);
      const response = await markAsVerified(reqStatusId).unwrap();
      toast.success("Verified");
      console.log("Marked as verified", response);
      refetch();
    } catch (error) {
      console.error("Marking as verified failed", error);
    }
  };

  const handleNeedsReUpload = async ({
    reqStatusId,
    reason,
  }: {
    reqStatusId: string;
    reason: string;
  }) => {
    try {
      // console.log(reqStatusId, reason);
      await needsReUpload({ reqStatusId, reason }).unwrap();
      toast.success("Send document for reupload");
      refetch();
    } catch (error) {
      console.error("Re-upload request failed", error);
    }
  };

  if(isLoading){
    return(
      <div className="ml-[40%] md:ml-[45%] mt-[15%] md:mt-[10%]">
        <CircularProgress/>
      </div>
    )
  }

  return (
    <Box sx={{ mt: {xs:5,md:2} }}>
      {commonInfo.stepNames.map((step: string, index: number) => {
        const currentStepNumber = commonInfo.currentStepNumber ?? 0;
        const isActive = index === (currentStepNumber - 1);
        const requirements = stepData?.requirements ?? [];
        const stepType = stepData?.stepType ?? "";
        const stepStatusId = stepData?.currentStepStatusId	 ?? "";
        
        return (
          <StepItem
            key={index}
            step={step}
            index={index}
            isActive={isActive}
            stepStatus={stepData?.stepStatus ?? ""}
            currentStepIndex={currentStepNumber - 1}
            requirements={requirements}
            showRequirements={
              isActive ? (
                <RequirementList
                  visaApplicationId={visaApplicationId??""}
                  stepSource={stepData?.stepSource ?? ""}
                  onMarkAsVerified={handleMarkAsVerified}
                  onNeedsReUpload={handleNeedsReUpload}
                  requirements={requirements}
                  stepData={stepData}
                  stepType={stepType}
                  refetch={refetch}
                  stepStatusId={stepStatusId}
                />
              ) : null
            }
            onApprove={handleApprove}
            onReject={handleReject}
            isApproveComplete={isApproveComplete}
            isRejectComplete={isRejectComplete}
          />
        );
      })}
    </Box>
  );
};

export default ApplicationProcess;