import { useNavigate, useParams } from "react-router-dom";
import { useFetchClientVisaApplicationsQuery } from "../../../features/admin/myClients/myClientsApi";
import { formatDate } from "../../../utils/FormateDate";

const ClientVisaApplications = () => {
  const { userid } = useParams();

  const { data, isLoading, isError } =
    useFetchClientVisaApplicationsQuery(userid);
  return (
    <div className="w-full h-full overflow-y-auto pb-44 px-5 custom-scrollbar">
      <div>
        <h1 className="text-xl text-neutrals-950 font-bold mt-6">
          Client Applications
        </h1>

        <div className="mt-5">
          <div className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 mr-10 md:mr-0">
            {isLoading ? (
              <p>Loading applications...</p>
            ) : isError ? (
              <p>Error fetching applications.</p>
            ) : data?.data?.length > 0 ? (
              data.data.map((application: any) => (
                <div
                  key={application._id}
                  className="min-w-[250px] sm:min-w-0 mr-2"
                >
                  <ApplicationCardComponent application={application} />
                </div>
              ))
            ) : (
              <p>No ongoing applications.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientVisaApplications;

const ApplicationCardComponent = ({
  application,
}: {
  application: any;
}) => {
  const navigate = useNavigate();

  const {
    _id: caseId,
    status,
    createdAt,
    visaTypeId,
  } = application;

  const submissionDate = formatDate(createdAt);
  const title = visaTypeId?.visaType || "Unknown Visa";

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
      <button
        className="mt-3 w-full bg-golden-yellow-400 text-neutrals-950 rounded-[20px] text-sm py-2 cursor-pointer"
        onClick={() =>
          navigate(`/admin/application/${caseId}`, {
            state: {
              row: application
            },
          })
        }
      >
        View
      </button>
    </div>
  );
};
