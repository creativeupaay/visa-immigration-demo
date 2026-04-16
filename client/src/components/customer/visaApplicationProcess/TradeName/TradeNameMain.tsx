import ProcessComponent from "../ProcessComponent";
import InitialPreferencesForm from "./InitialPreferencesForm";
import TradeNameApproved from "./TradeNameApproved";
import { useFetchTradeInfoQuery } from "../../../../features/admin/visaApplication/additional/dubaiApis";
import { useEffect } from "react";
import { useApproveStepMutation } from "../../../../features/admin/visaApplicationInformation/visaApplicationInformationApi";
import { useParams } from "react-router-dom";

const TradeNameMain = ({
  stepStatusId,
  stepData,
  onContinue,
}: {
  stepStatusId: string;
  stepData: any;
  onContinue: () => void;
}) => {
  const { data, refetch } = useFetchTradeInfoQuery({ stepStatusId });
  const { visaApplicationId } = useParams();
  const [approveStep] = useApproveStepMutation();

  useEffect(() => {
    console.log("data", data);
  }, [data]);

  const handleContinue = () => {
    approveStep(visaApplicationId)
      .unwrap()
      .then(() => {
        onContinue();
      });
  };

  if (data?.data === null) {
    return (
      <InitialPreferencesForm stepStatusId={stepStatusId} refetch={refetch} />
    );
  }
  if (["ChangeReq_Sent", "TradeNames_Uploaded"].includes(data?.data?.status)) {
    return (
      <ProcessComponent
        date=""
        label="Processing"
        status=""
        message={stepData.inProgressMessage || ""}
      />
    );
  }
  if (
    ["ChangeReq_Approved", "ChangeReq_Rejected", "TradeName_Assigned"].includes(
      data?.data?.status
    )
  ) {
    return (
      <TradeNameApproved
        stepStatusId={stepStatusId}
        data={data}
        onContinue={handleContinue}
        refetch={refetch}
      />
    );
  }

  return <div></div>;
};

export default TradeNameMain;
