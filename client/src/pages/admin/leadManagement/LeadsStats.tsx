import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { useFetchLeadsStatsQuery } from "../../../features/admin/leadManagement/leadManagementApi";
import StatsCard from "../../../features/admin/dashboard/components/StatsCard";

const LeadsStats: React.FC = () => {
  const { data, isLoading } = useFetchLeadsStatsQuery(undefined);

  const cardColors = ["#F6F5F5", "#FEFDEB"];

  const statsConfig = [
    {
      key: "INITIATED",
      title: "New Leads This Month",
      getValue: (data: any) => data?.INITIATED || 0,
    },
    {
      key: "totalLeads",
      title: "Total Leads",
      getValue: (data: any) => data?.totalLeads || 0,
    },
    {
      key: "PAYMENTDONE",
      title: "Completed Applications",
      getValue: (data: any) => data?.PAYMENTDONE || 0,
    },
    {
      key: "REJECTED",
      title: "Rejected Applications",
      getValue: (data: any) => data?.REJECTED || 0,
    },
    {
      key: "conversionRate",
      title: "Lead Conversion Rate",
      getValue: (data: any) => `${data?.conversionRate || 0}%`,
    },
  ];

  if (isLoading) return <div>Loading...</div>;

  return (
    <Box sx={{ py: 3 }}>
      {data?.currentMonth && (
        <Typography
          variant="subtitle1"
          sx={{
            mb: 3,
            color: "#666",
            fontStyle: "italic",
          }}
        >
          Current Month: {data.currentMonth.month}/{data.currentMonth.year}
        </Typography>
      )}

      <Stack
        direction="row"
        gap={"10px"}
        sx={{
          flexWrap: "wrap",
          "& > *": {
            minWidth: 200,
            maxWidth: {
              xs: "100%", // Full width on small screens
              sm: 250,
            },
            width: "100%",
          },
        }}
      >
        {statsConfig.map((stat, index) => (
          <StatsCard
            key={stat.key}
            title={stat.title}
            value={stat.getValue(data?.data || data)}
            bgcolor={cardColors[index % 2]}
            change=""
          />
        ))}
      </Stack>
    </Box>
  );
};

export default LeadsStats;