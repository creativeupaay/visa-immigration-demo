import {
  Button,
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../../../utils/FormateDate";

type RecentUpdate = {
  _id: string;
  logMsg: string;
  createdAt: string;
  visaApplicationId: string;
};

const RecentUpdates = ({ data }: { data: RecentUpdate[] }) => {
  const navigate = useNavigate();

  // console.log(data)

  return (
    <Card
      sx={{
        bgcolor: "#F6F5F5",
        width: "100%",
        borderRadius: "15px",
        boxShadow: "none",
        overflowX: "auto",
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Typography
            sx={{
              fontWeight: "bold",
              fontSize: "18px",
              mb: 2,
              textAlign: { xs: "left", sm: "left" },
            }}
          >
            Recent Application Updates
          </Typography>
          <Typography
            color="primary"
            style={{ textDecoration: "underline", cursor: "pointer" }}
            onClick={() => navigate("/admin/logs")}
          >
            View all
          </Typography>
        </Stack>

        <div style={{ overflowX: "auto" }}>
          <Table
            size="small"
            sx={{
              minWidth: "280px",
              tableLayout: "auto",
              "& th, & td": {
                whiteSpace: "nowrap",
              },
            }}
          >
            <TableHead>
              <TableRow>
                {["Log Message", "Created At", "Action"].map((header) => (
                  <TableCell key={header} sx={{ color: "#8D8883" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((item) => (
                <TableRow key={item._id}>
                  <TableCell>{item.logMsg}</TableCell>
                  <TableCell>{formatDate(item.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() =>
                        navigate(
                          `/admin/application/${item.visaApplicationId}`,
                          {
                            // state: { row: { ...item, leadId: item.leadId } },
                          }
                        )
                      }
                      size="small"
                      sx={{
                        textTransform: "none",
                        color: "#000",
                        fontWeight: 500,
                      }}
                    >
                      View &gt;
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentUpdates;
