  import {
    Box,
    Card,
    CardContent,
    LinearProgress,
    Stack,
    Typography,
  } from "@mui/material";
  import Map from "../../../../assets/Admin/Map.png";
  import { RevenueDataTypes } from "../dashboardTypes";

  // All possible visa types you want to show, in order
  const visaTypes = ["Dominica", "Grenada", "Portugal", "Dubai"];

  const RevenueCard = ({ data = [] }: { data: RevenueDataTypes[] }) => {
    // Create a map for quick access to totalRevenue by visaType
    const dataMap = data.reduce((acc, item) => {
      acc[item.visaType] = item.totalRevenue;
      return acc;
    }, {} as Record<string, number>);

    // Fill missing types with 0
    const mergedData = visaTypes.map((type) => ({
      visaType: type,
      totalRevenue: dataMap[type] || 0,
    }));

    // console.log(data)
    // Get the max revenue to scale the progress bars
    const maxRevenue = data.reduce((acc, item) => acc + item.totalRevenue, 0);
    
    return (
      <Card
        sx={{
          boxShadow: "none",
          bgcolor: "#FEFDEB",
          borderRadius: "15px",
          minWidth: {xs:"280px", md :"300px"},
          p: 0,
        }}
      >
        <CardContent>
          <Typography sx={{ fontWeight: "bold", fontSize: "18px", mb: 5 }}>
            Revenue by Location
          </Typography>
          <img src={Map} alt="Map" />
          <Stack sx={{ mt: 2, gap: "16px" }}>
            {mergedData.map((item) => (
              <Box key={item.visaType}>
                <Stack direction="row" justifyContent={"space-between"}>
                  <Typography fontSize={"12px"}>{item.visaType}</Typography>
                  <Typography fontSize={"12px"}>
                    ${(item.totalRevenue / 1000).toFixed(1)}K
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={(item.totalRevenue / maxRevenue) * 100}
                />
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  };

  export default RevenueCard;
