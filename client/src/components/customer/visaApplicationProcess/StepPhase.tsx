import { Phase } from "../../../pages/customer/dashboard/VisaApplicationProcess";
import Requirements from "./Requirements";
import Approved from "./Approved";
import ProcessComponent from "./ProcessComponent";
import MedicalApproved from "./Medical/MedicalApproved";
import AIMAClientComponent from "./AIMA_Appointment/AIMAClientComponent";
import BankDetails from "./Bank/BankDetails";
import DGInvestmentMain from "../../admin/visaApplicationInformation/DGInvestment/DGInvestmentMain";
import VisaCompletionDetailsGrenadaDominica from "./VisaCompletionComponents/VisaCompletionDetailsGrenedaDominica";
import TradeNameMain from "./TradeName/TradeNameMain";
import MoaSigningMain from "./MoaSigning/MoaSigningMain";
import MedicalMain from "./Medical/MedicalMain";
import PaymentMain from "./Payment/PaymentMain";

const StepPhase: React.FC<{
  phase: Phase;
  visaType: string;
  visaApplicationId: string;
  requirementData: any;
  currentStepName: string;
  stepData: any;
  stepType: string;
  onContinue: () => void;
  stepSource: string;
  stepStatus: string;
  refetch: () => void;
  onSubmit: () => void;
}> = ({
  phase,
  visaType,
  visaApplicationId,
  requirementData,
  currentStepName,
  stepType,
  onContinue,
  stepData,
  stepSource,
  stepStatus,
  refetch,
  onSubmit,
}) => {
  if (stepType === "DGDELIVERY") {
    return (
      <>
        <VisaCompletionDetailsGrenadaDominica stepStatusId={stepData.currentStepStatusId} stepData={stepData} />
      </>
    );
  } else if (stepType === "DGINVESTMENT") {
    return <DGInvestmentMain visaApplicationId={visaApplicationId} visaType={visaType} stepData={stepData} onContinue={onContinue} currentStepName={currentStepName} />;
  } 
  else if(stepType==="TRADE_NAME"){
    return <TradeNameMain stepStatusId={stepData.currentStepStatusId} stepData={stepData} onContinue={onContinue}/>
  }
  else if(stepType==="MOA_SIGNING" && phase==="IN_PROGRESS"){
    return <MoaSigningMain stepStatusId={stepData.currentStepStatusId} stepData={stepData}/>
  }
  else if(stepType==="MEDICAL_TEST" ){
    return <MedicalMain stepStatusId={stepData.currentStepStatusId} phase={phase} stepData={stepData} onContinue={onContinue}/>
  }
  else if(stepType==="DUBAI_PAYMENT" ){
    return <PaymentMain stepStatusId={stepData.currentStepStatusId} stepData={stepData} phase={phase} onContinue={onContinue}/>
  }
  else if (phase === "APPROVED" && stepType !== "AIMA") {
    if (stepType === "BANK") {
      return (
        <BankDetails
          onContinue={onContinue}
          requirementData={requirementData}
        />
      );
    } else if (["GENERAL","EMPTY","DUBAI_PAYMENT","MOA_SIGNING"].includes(stepType)) {
      return (
        <Approved
          stepSource={stepSource}
          requirementData={requirementData}
          currentStepName={currentStepName}
          onContinue={onContinue}
        />
      );
    } else if (stepType === "MEDICAL") {
      return <MedicalApproved onContinue={onContinue} />;
    }
  } else if (
    phase === "IN_PROGRESS" ||
    phase === "SUBMITTED" ||
    phase === "APPROVED"
  ) {
    if (stepType === "AIMA") {
      return (
        <>
          {stepData?.aimaDocs && (
            <AIMAClientComponent
              aimaDocs={stepData.aimaDocs}
              approved={phase === "APPROVED"}
              onContinue={onContinue}
            />
          )}
        </>
      );
    } else if (stepSource === "ADMIN") {
      return (
        <div>
          <ProcessComponent
            label="Request in Progress"
            date="13 Feb 2025, 12:30 P.M."
            status="in_progress"
            message={stepData.inProgressMessage || "Your request is being processed by our team. We will notify you once it is completed."}
          />
        </div>
      );
    }

    return (
      <Requirements
        stepStatus={stepStatus}
        stepType={stepType}
        phase={phase}
        requirementData={requirementData}
        refetch={refetch}
        onSubmit={onSubmit}
      />
    );
  }
};

export default StepPhase;
