import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import StatsCard from "../../../features/admin/dashboard/components/StatsCard";
import { useFetchConsultationsStatsQuery } from "../../../features/admin/consultations/consultationApi";

const ConsultationsStats: React.FC = () => {
  const { data, isLoading } = useFetchConsultationsStatsQuery(undefined);

  const cardColors = ["#F6F5F5", "#FEFDEB"];

  const statsConfig = [
    {
      key: "CONSULTATIONLINKSENT",
      title: "Consultation Links Sent",
      getValue: (data: any) => data?.CONSULTATIONLINKSENT || 0,
    },
    {
      key: "CONSULTATIONSCHEDULED",
      title: "Consultations Scheduled",
      getValue: (data: any) => data?.CONSULTATIONSCHEDULED || 0,
    },
    {
      key: "CONSULTATIONDONE",
      title: "Consultations Completed",
      getValue: (data: any) => data?.CONSULTATIONDONE || 0,
    },
    {
      key: "PAYMENTLINKSENT",
      title: "Payment Links Sent",
      getValue: (data: any) => data?.PAYMENTLINKSENT || 0,
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

export default ConsultationsStats;