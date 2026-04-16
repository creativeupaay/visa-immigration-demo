import { Box } from "@mui/system";
import RecentLeadManagement from "../../../features/admin/dashboard/components/RecentLeadManagment";
import { useEffect, useState } from "react";
import { AllLeads } from "../../../features/admin/leadManagement/leadManagementTypes";
import {
  useFetchAnalyticsQuery,
  useFetchRecentConsultationQuery,
  useFetchRecentLeadsQuery,
  useFetchRecentUpdatesQuery,
  useFetchRevenueQuery,
} from "../../../features/admin/dashboard/dashboardApi";
import RecentConsultations from "../../../features/admin/dashboard/components/RecentConsultations";
import { AllConsultationsTypes } from "../../../features/admin/consultations/consultationTypes";
import StatsCard from "../../../features/admin/dashboard/components/StatsCard";
import RevenueCard from "../../../features/admin/dashboard/components/RevenueCard";
import RecentUpdates from "../../../features/admin/dashboard/components/RecentUpdates";
import {
  AnalyticsTypes,
  RecentUpdatesTypes,
  RevenueDataTypes,
} from "../../../features/admin/dashboard/dashboardTypes";

// Main Dashboard Component
const Dashboard = () => {
  const {
    data: recentLeadsData,
    isLoading,
    isError,
  } = useFetchRecentLeadsQuery(undefined);

  const { data: fetchedConsultationData } =
    useFetchRecentConsultationQuery(undefined);

  const { data: fetchedRecentUpdatesData } =
    useFetchRecentUpdatesQuery(undefined);

  const { data: fetchedRevenueData } = useFetchRevenueQuery(undefined);
  const { data: fetchedAnalytics } = useFetchAnalyticsQuery(undefined);

  const [leadData, setLeadData] = useState<AllLeads[]>([]);
  const [consultationData, setConsultationData] = useState<
    AllConsultationsTypes[]
  >([]);
  const [recentUpdatesData, setRecentUpdatesData] = useState<
    RecentUpdatesTypes[]
  >([]);
  const [revenueData, setRevenueData] = useState<RevenueDataTypes[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsTypes>();

  useEffect(() => {
    if (recentLeadsData && !isLoading && !isError) {
      setLeadData(recentLeadsData.leads ?? []);
    }
  }, [recentLeadsData, isLoading, isError]);

  useEffect(() => {
    if (fetchedConsultationData) {
      setConsultationData(fetchedConsultationData.consultations ?? []);
    }
    if (fetchedRecentUpdatesData) {
      setRecentUpdatesData(fetchedRecentUpdatesData.data ?? []);
    }
    if (fetchedRevenueData) {
      setRevenueData(fetchedRevenueData.revenue ?? []);
    }
    if (fetchedAnalytics) {
      setAnalyticsData(fetchedAnalytics);
    }
  }, [
    fetchedConsultationData,
    fetchedRecentUpdatesData,
    fetchedRevenueData,
    fetchedAnalytics,
  ]);

  return (
    <div className="ml-[-10px] md:ml-[0px] z-50">
      <Box
        sx={{
          display: "grid",
          gap: { xs: 1, sm: 1, md: 2, lg: 3 },
          px: { xs: 1, sm: 1, md: 5 },
          my: 2,
          gridTemplateColumns: {
            xs: "repeat(2, 1fr)",
            sm: "repeat(2, 1fr)",
            md: "repeat(2, 1fr)",
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        <StatsCard
          title="New Leads This Month"
          value={analyticsData?.newLeadsLast30Days}
          change=""
          bgcolor="#F6F5F5"
        />
        <StatsCard
          title="Lead Conversion Rate"
          value={analyticsData?.leadConversionRate}
          change=""
          bgcolor="#FEFDEB"
        />
        <StatsCard
          title="Pending Applications"
          value={analyticsData?.pendingApplications}
          change=""
          bgcolor="#F6F5F5"
        />
        <StatsCard
          title="Completed Applications"
          value={analyticsData?.completedApplications}
          change=""
          bgcolor="#FEFDEB"
        />
      </Box>

      <Box
        sx={{
          my: 2,
          display: "flex",
          pr: 2,
          pl: 5,
          ml: { xs: "-35px", md: "0" },
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          // alignItems:"center"
        }}
      >
        <RevenueCard data={revenueData} />
        <RecentLeadManagement data={leadData} />
      </Box>
      <Box
        sx={{
          my: 3,
          display: "flex",
          pr: 2,
          pl: 5,
          ml: { xs: "-35px", md: "0" },
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
          // alignItems:"center"
        }}
      >
        <RecentConsultations data={consultationData} />
        <RecentUpdates data={recentUpdatesData} />
      </Box>
    </div>
  );
};

export default Dashboard;
