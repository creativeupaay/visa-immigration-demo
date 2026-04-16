import { Box, Card, Typography } from "@mui/material";

const StatsCard = ({
  title,
  value,
  change,
  bgcolor,
}: {
  title: string;
  value: string | number | undefined;
  change: string;
  bgcolor: string;
}) => {
  return (
    <Card
      sx={{
        p:2,
        textAlign: "center",
        bgcolor,
        boxShadow: "none",
        borderRadius: "15px",
        width: {
          xs: "100%",     
          sm: "48%",     
          md: "100%",    
        },
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          fontSize: { xs: "12px", md: "14px" },
          display: "flex",
          justifyContent:"start",
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          mt: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: { xs: "28px", md: "28px" } }}>
          {value}
        </Typography>
        <Typography variant="caption" fontSize="12px">
          {change}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatsCard;
