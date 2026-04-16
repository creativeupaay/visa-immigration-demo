import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Typography,
  CircularProgress,
} from "@mui/material";
import { useFetchParticularLeadLogsQuery, useFetchVisaApplicationLogsQuery } from "../logsApi";
import { useParams } from "react-router-dom";
import { formatDate } from "../../../../utils/FormateDate";


interface LogsComponentProps {
  isParticularVisaApplication: boolean;
}

const LogsComponent: React.FC<LogsComponentProps> = ({
  isParticularVisaApplication
}) => {

  const { visaApplicationId, leadid } = useParams();
  const leadId=leadid;
  const {
    data: visaLogs,
    isLoading: isVisaLoading,
    isError: isVisaError,
  } = useFetchVisaApplicationLogsQuery(visaApplicationId!, {
    skip: !isParticularVisaApplication || !visaApplicationId,
  });

  const {
    data: leadLogs,
    isLoading: isLeadLoading,
    isError: isLeadError,
  } = useFetchParticularLeadLogsQuery(leadId!, {
    skip: isParticularVisaApplication || !leadId,
  });

  const logsData = isParticularVisaApplication
    ? visaLogs?.logs || []
    : leadLogs?.logs || [];

  const isLoading = isParticularVisaApplication ? isVisaLoading : isLeadLoading;
  const isError = isParticularVisaApplication ? isVisaError : isLeadError;

  return (
    <Box p={{ xs: 1, md: 2 }}>
      {isLoading ? (
        <div className="h-[50vh] flex justify-center items-center">
                  <CircularProgress />

        </div>
      ) : isError ? (
        <Typography color="error">Failed to load logs.</Typography>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                    Task
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                    Done By
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ fontSize: "16px", fontWeight: 600 }}>
                    Timestamp
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logsData.map((log: any) => (
                <TableRow key={log._id}>
                  <TableCell>{log.logMsg}</TableCell>
                  <TableCell>{log.doneBy || "-"}</TableCell>
                  <TableCell>{formatDate(log?.createdAt) || "-"}</TableCell> 
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default LogsComponent;
