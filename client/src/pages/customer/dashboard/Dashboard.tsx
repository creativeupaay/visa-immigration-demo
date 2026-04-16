import { CircularProgress } from "@mui/material";
import ApplicationCard from "../../../features/customer/dashboard/components/ApplicationCard";
import { useGetApplicationsQuery } from "../../../features/customer/dashboard/dashboardApi";
import { formatDate } from "../../../utils/FormateDate";

const Dashboard = () => {
  const { data, isLoading, isError } = useGetApplicationsQuery(undefined);

  if (isLoading) {
    return (
      <div className="w-full h-[70vh] flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-y-auto pb-44 px-5 custom-scrollbar">
      {/* Ongoing applications section */}
      <div>
        <h1 className="text-xl text-neutrals-950 font-bold">
          Ongoing Applications
        </h1>

        <div className="mt-5">
          <div className="flex overflow-x-auto gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 mr-10 md:mr-0">
            {isError ? (
              <p>Error fetching applications.</p>
            ) : data?.data?.length > 0 ? (
              data.data.map((application: any) => (
                <div
                  key={application._id}
                  className="min-w-[250px] sm:min-w-0 mr-2"
                >
                  <ApplicationCard
                    visaApplicationId={application._id}
                    caseId={application.nanoVisaApplicationId}
                    status={application.status}
                    submissionDate={formatDate(application.createdAt)}
                    title={application.visaTypeId?.visaType || "Unknown Visa"}
                  />
                </div>
              ))
            ) : (
              <p>No ongoing applications.</p>
            )}
          </div>
        </div>
      </div>

      {/* Pending actions section */}
      {/* <div className="mt-10">
        <h1 className="text-xl text-neutrals-950 font-bold">Pending Actions</h1>

        <div className="mt-5">
          <CustomTable
            headers={["Tasks", "Application", "Action"]}
            contents={[
              {
                task: "Upload missing documents for your trade license application.",
                application: "Dubai Business Setup",
                action: "View",
              },
              {
                task: "Upload missing documents for your trade license application.",
                application: "Dubai Business Setup",
                action: "View",
              },
              {
                task: "Upload missing documents for your trade license application.",
                application: "Dubai Business Setup",
                action: "View",
              },
            ]}
          />
        </div>
      </div> */}
    </div>
  );
};

export default Dashboard;
