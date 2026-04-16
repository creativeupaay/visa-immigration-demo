import { useNavigate } from "react-router-dom";
import { ApplicationCardProps } from "../dashboardTypes";

const ApplicationCard = ({ caseId, status, submissionDate, title,visaApplicationId }: ApplicationCardProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col bg-neutrals-50 rounded-4xl px-4 py-4">
      <h2 className="text-neutrals-950 font-bold mb-4">{title}</h2>
      <div className="w-full grid grid-cols-2 text-neutrals-950 text-sm gap-y-2">
        <h3 className="font-semibold">Case ID</h3>
        <p className="truncate">{caseId || visaApplicationId}</p>

        <h3 className="font-semibold">Status</h3>
        <p>{status}</p>

        <h3 className="font-semibold">Submission Date</h3>
        <p>{submissionDate}</p>
      </div>

      <button
        className="mt-3 w-full bg-golden-yellow-400 text-neutrals-950 rounded-[20px] text-sm py-2 cursor-pointer"
        onClick={() => navigate(`/application/${visaApplicationId}`)} 
      >
        View
      </button>
    </div>
  );
};

export default ApplicationCard;
