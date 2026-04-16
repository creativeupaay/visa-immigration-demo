import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import StatsCard from "../../../features/admin/dashboard/components/StatsCard";
import { useFetchInvoicesStatsQuery } from "./invoicesManagementApi";
import { formatAmount } from "../../../utils/formatAmount";

const InvoicesStats: React.FC = () => {
  const { data, isLoading } = useFetchInvoicesStatsQuery(undefined);

  const cardColors = ["#F6F5F5", "#FEFDEB"];

  const statsConfig = [
    {
      key: "totalRevenueUSD",
      title: "Total Revenue (USD)",
      getValue: (data: any) => formatAmount(data?.totalRevenueUSD) || 0,
    },
    {
      key: "linkSentCount",
      title: "Pending Invoices",
      getValue: (data: any) => data?.linkSentCount || 0,
    },
    {
      key: "paidCount",
      title: "Paid Invoices",
      getValue: (data: any) => data?.paidCount || 0,
    },
    {
      key: "failedCount",
      title: "Failed Invoices",
      getValue: (data: any) => data?.failedCount || 0,
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

export default InvoicesStats;