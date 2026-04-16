import { useEffect, useState } from "react";
import { useGetPreviousApplicationsQuery } from "../../../features/customer/dashboard/dashboardApi";
import PreviousApplicationCard from "../../../features/customer/dashboard/components/PreviousApplicationCard";

const PrevApplications = () => {
  const { data } = useGetPreviousApplicationsQuery(undefined);
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    if (data) {
      setApplications(data);
    }
  }, [data]);

  return (
    <div className="w-full h-full px-5">
      {/* All applications section */}
      <div>
        <div className="flex items-center justify-between">
          <h1 className="text-xl text-neutrals-950 font-bold">
            All Applications
          </h1>
        </div>

        <div className="mt-5 flex flex-wrap gap-4">
          {applications?.length > 0 ? (
            applications.map((app: any) => (
              <PreviousApplicationCard
                key={app.caseId}
                caseId={app.caseId}
                status={app.status}
                submissionDate={app.submissionDate}
                title={app.title}
              />
            ))
          ) : (
            <p>No previous applications found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrevApplications;
