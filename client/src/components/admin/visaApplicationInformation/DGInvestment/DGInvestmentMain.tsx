import { useState } from "react";
import { useSelectInvestmentoptionMutation } from "../../../../features/admin/visaApplication/additional/dominicaApis";
import BankDetails from "./BankDetails";
import DGOptions from "./DGOptions";
import UploadInvoice from "./UploadInvoice";
import ProcessComponent from "../../../customer/visaApplicationProcess/ProcessComponent";
import Approved from "../../../customer/visaApplicationProcess/Approved";
import { useLazyGetCurrentStepInfoQuery } from "../../../../features/common/commonApi";
import RealEstateOptions from "./RealEstateOptions";

const DGInvestmentMain = ({
  currentStepName,
  visaApplicationId,
  visaType,
  stepData,
  onContinue,
}: {
  currentStepName: string;
  visaApplicationId: string;
  visaType: string;
  stepData: any;
  onContinue: () => void;
}) => {
  const [selectInvestmentOption, { isLoading }] =
    useSelectInvestmentoptionMutation();
  
  const [getCurrentStepInfo, { isLoading: isLoadingStepInfo }] =
    useLazyGetCurrentStepInfoQuery();

  const [uploadInvoice, setUploadInvoice] = useState(false);


  const refetchCurrentStepInfo = async () => {
    try {
      await getCurrentStepInfo(visaApplicationId).unwrap();
    } catch (error) {
      console.error("Error fetching current step info:", error);
    }
  }

  const handleOptionSelected = async (option: string) => {
    console.log("Selected option:", option);
    try {
      await selectInvestmentOption({
        investmentOption: option,
        stepStatusId: stepData.currentStepStatusId,
      }).unwrap();
      
      // After successful selection, get current step info
        await refetchCurrentStepInfo();
    } catch (error) {
      console.error("Error selecting investment option:", error);
    }
  };

  if (stepData.stepStatus === "SUBMITTED") {
    return <ProcessComponent label="Processing" date="" status="" message={stepData.inProgressMessage}/>;
  }
  
  if (stepData.stepStatus === "APPROVED") {
    return <Approved currentStepName={currentStepName} onContinue={onContinue} />;
  }
  
  if (uploadInvoice) {
    return (
      <UploadInvoice stepStatusId={stepData.currentStepStatusId} refetch={refetchCurrentStepInfo} />
    );
  }
  else if (
    stepData?.dgInvestmentData?.investInfo?.dgInvestStatus === "optionSelected"
  ) {
    if (
      ["EDF", "NTF"].includes(
        stepData?.dgInvestmentData?.investInfo?.investmentOption
      )
    ) {
      return (
        <BankDetails 
          uploadInvoice={() => setUploadInvoice(true)} 
          bankDetails={stepData?.dgInvestmentData?.bankDetails} 
        />
      );
    }
  }
  else if(stepData?.dgInvestmentData?.investInfo?.investmentOption==="REAL_STATE"){
    return (
        <RealEstateOptions
        uploadInvoice={() => setUploadInvoice(true)} 
        realEstateOptions={stepData.dgInvestmentData.investInfo.realStateOptions}
        />
    )
  }
   else {
    return (
      <div>
        <DGOptions
          isLoading={isLoading || isLoadingStepInfo}
          visaType={visaType}
          onOptionSelected={handleOptionSelected}
        />
      </div>
    );
  }
};

export default DGInvestmentMain;