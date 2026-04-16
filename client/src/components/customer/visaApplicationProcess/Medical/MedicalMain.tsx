import {
  useFetchMedicalTestInfoQuery,
  useSendReschedulingReqMutation,
} from "../../../../features/admin/visaApplication/additional/dubaiApis";
import ProcessComponent from "../ProcessComponent";
import MedicalDetails from "./MedicalDetails";

const MedicalMain = ({ stepStatusId,phase,onContinue,stepData }: { stepStatusId: string,phase:string,onContinue:()=>void,stepData:any }) => {
  const { data, refetch } = useFetchMedicalTestInfoQuery({
    stepStatusId,
  });
  const [requestReschedule] = useSendReschedulingReqMutation();
  const handleRescheduleRequest = async (reason: string) => {
    requestReschedule({stepStatusId, reason })
      .unwrap()
      .then(() => {
        refetch();
      })
      .catch((err) => {
        console.log(err);
      });
  };



  if (!data?.data || data?.data?.medicalInfo?.status === "RescheduleReq_Sent") {
    return <ProcessComponent label="Processing" date={""} status="" message={stepData.inProgressMessage} />;
  }
  return (
    <div>
      <MedicalDetails
        phase={phase}
        onContinue={onContinue}
        handleRescheduleRequest={handleRescheduleRequest}
        data={data?.data?.medicalInfo}
      />
    </div>
  );
};

export default MedicalMain;
