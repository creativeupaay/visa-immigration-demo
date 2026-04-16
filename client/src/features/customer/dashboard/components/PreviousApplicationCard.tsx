import { ApplicationCardProps } from "../dashboardTypes";

const PreviousApplicationCard = ({ caseId, status, submissionDate, title }: ApplicationCardProps) => {

  return (
    <div className="flex flex-col bg-neutrals-50 rounded-4xl px-4 py-4">
      <h2 className="text-neutrals-950 font-bold mb-4">{title}</h2>
      <div className="w-full grid grid-cols-2 text-neutrals-950 text-sm gap-y-2">
        <h3 className="font-semibold">Case ID</h3>
        <p className="truncate">{caseId}</p>

        <h3 className="font-semibold">Status</h3>
        <p>{status}</p>

        <h3 className="font-semibold">Submission Date</h3>
        <p>{submissionDate}</p>
      </div>
    </div>
  );
};

export default PreviousApplicationCard;
