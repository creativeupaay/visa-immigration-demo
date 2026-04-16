import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { AllConsultationsTypes } from "../../consultations/consultationTypes";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";

interface TableProps {
  data: AllConsultationsTypes[] | undefined;
}

const RecentConsultations: React.FC<TableProps> = ({ data }) => {
  const navigate = useNavigate();

  return (
    <Paper
      sx={{
        width: { xs: "100%", md: "413px" },
        p: 2,
        borderRadius: "15px",
        boxShadow: "none",
        bgcolor: "#F6F5F5",
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontWeight: "bold", fontSize: "18px" }}>
          Scheduled Consultations
        </Typography>
      </Box>

      {/* Horizontal Scroll Wrapper */}
      <Box sx={{
          overflowX: { xs: "auto", md: "visible" },
        }}>
        <Table sx={{ minWidth: 400, tableLayout: "auto" }}>
          <TableHead>
            <TableRow>
              {["Name", "Date & Time", "Action"].map((header) => (
                <TableCell
                  key={header}
                  sx={{ color: "#8D8883", whiteSpace: "nowrap", fontWeight: 500 }}
                >
                  {header}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data && data.length > 0 ? (
              data.map((consultation, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ borderBottom: "none", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {consultation.name}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "none", fontSize: "13px", whiteSpace: "nowrap" }}>
                    {dayjs(consultation.startTime).format("D MMM  h:mm A")}
                  </TableCell>

                  <TableCell sx={{ borderBottom: "none", whiteSpace: "nowrap" }}>
                    <Button
                      onClick={() => navigate("/admin/consultations")}
                      size="small"
                      sx={{ textTransform: "none", color: "black" }}
                    >
                      View &gt;
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  align="center"
                  sx={{ fontSize: "14px", color: "#999", py: 2 }}
                >
                  No recent consultations
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Box>
    </Paper>
  );
};

export default RecentConsultations;
