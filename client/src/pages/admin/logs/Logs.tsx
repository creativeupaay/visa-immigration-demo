import React from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import { useFetchAllLogsQuery } from "../../../features/admin/logs/logsApi";
import { formatDate } from "../../../utils/FormateDate";

const Logs: React.FC = () => {
  const { data, isLoading, isError } = useFetchAllLogsQuery(undefined);

  return (
    <Box p={{ md: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: "bolder", mb: 2 }}>
        Activity Logs
      </Typography>

      {isLoading ? (
        <div className="h-[70vh] flex justify-center items-center">
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
              {data?.logs?.map((log: any) => (
                <TableRow key={log._id} sx={{ borderBottom: "none" }}>
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

export default Logs;
