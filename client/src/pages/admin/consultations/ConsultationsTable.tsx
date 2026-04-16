import React, { useState } from "react";
import dayjs from "dayjs";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  TablePagination,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  useMediaQuery,
  Card,
  CardContent,
} from "@mui/material";
import { AllConsultationsTypes } from "../../../features/admin/consultations/consultationTypes";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
interface TableProps {
  data: AllConsultationsTypes[] | undefined;
  pagination?: PaginationData | undefined;
  statusFilter?: string;
  onStatusFilterChange?: (filter: string) => void;
  dateFilter?: string;
  onDateFilterChange?: (filter: string) => void;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (limit: number) => void;
  onJoinNow?: (consultation: AllConsultationsTypes) => void;
  onReschedule?: (consultation: AllConsultationsTypes) => void;
}

const ConsultationsTable: React.FC<TableProps> = ({
  data,
  pagination,
  statusFilter = "All",
  onStatusFilterChange,
  dateFilter = "All",
  onDateFilterChange,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(5);

  const handleChangePage = (_event: unknown, newPage: number) => {
    if (onPageChange) {
      // Convert from 0-based (MUI) to 1-based (backend)
      onPageChange(newPage + 1);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    if (onRowsPerPageChange) {
      onRowsPerPageChange(newLimit);
    } else {
      setInternalRowsPerPage(newLimit);
      setInternalPage(0);
    }
  };

  const handleStatusFilterChange = (event: any) => {
    if (onStatusFilterChange) {
      onStatusFilterChange(event.target.value);
    }
  };
  const handleDateFilterChange = (event: any) => {
    if (onDateFilterChange) {
      onDateFilterChange(event.target.value);
    }
  };

  const currentPage = pagination ? pagination.page - 1 : internalPage;
  const currentLimit = pagination ? pagination.limit : internalRowsPerPage;
  const totalCount = pagination ? pagination.total : data?.length;

  const displayData = pagination
    ? data
    : data?.slice(
        currentPage * currentLimit,
        currentPage * currentLimit + currentLimit
      );

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      {/* Filters */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
          Scheduled Consultations
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* <ExportToExcelButton/> */}
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Date</InputLabel>
            <Select
              value={dateFilter}
              onChange={handleDateFilterChange}
              label="Date"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="Today">Today</MenuItem>
              <MenuItem value="Yesterday">Yesterday</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 140 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Status"
            >
              <MenuItem value="All">All</MenuItem>
              <MenuItem value="SCHEDULED">Scheduled</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
              <MenuItem value="MISSED">Missed</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Responsive UI */}
      {isMobile ? (
        <>
          {displayData?.length ? (
            displayData.map((consultation) => (
              <Card
                key={consultation._id}
                sx={{
                  mt: 2,
                  borderRadius: "15px",
                  boxShadow: "none",
                  border: "1px solid black",
                }}
              >
                <CardContent>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Name:</strong> {consultation.name}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Date:</strong>{" "}
                    {dayjs(consultation.startTime).format("MMM D, YYYY")}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Time:</strong>{" "}
                    {dayjs(consultation.startTime).format("h:mm A")}
                  </Typography>
                  <Typography sx={{ mb: 1 }}>
                    <strong>Status:</strong>{" "}
                    <span
                      style={{
                        color:
                          consultation.status === "CANCELLED"
                            ? "#F54337"
                            : consultation.status === "SCHEDULED"
                            ? "#F6C328"
                            : consultation.status === "MISSED"
                            ? "#F54337"
                            : "#64AF64",
                      }}
                    >
                      {consultation.status.charAt(0).toUpperCase() +
                        consultation.status.slice(1).toLowerCase()}
                    </span>
                  </Typography>

                  {consultation.status === "SCHEDULED" && (
                    <Box mt={2} display="flex" gap={2}>
                      <a
                        href={consultation.rescheduleUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          variant="outlined"
                          sx={{
                            textTransform: "none",
                            borderColor: "black",
                            borderRadius: "15px",
                            color: "black",
                          }}
                        >
                          Reschedule
                        </Button>
                      </a>
                      <a
                        href={consultation.joinUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Button
                          sx={{
                            backgroundColor: "#F6C328",
                            color: "black",
                            textTransform: "none",
                            borderRadius: "15px",
                          }}
                        >
                          Join Now
                        </Button>
                      </a>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Typography>No Consultations found</Typography>
          )}
        </>
      ) : (
        // Desktop Table
        <TableContainer sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                {["Name", "Date & Time", "Status", "Action"].map((header) => (
                  <TableCell key={header} sx={{ color: "#8D8883" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData?.length ? (
                displayData.map((consultation) => (
                  <TableRow key={consultation._id}>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {consultation.name}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Typography>
                        {dayjs(consultation.startTime).format("MMM D, YYYY")}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {dayjs(consultation.startTime).format("h:mm A")}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Typography
                        sx={{
                          color:
                            consultation.status === "CANCELLED"
                              ? "#F54337"
                              : consultation.status === "SCHEDULED"
                              ? "#F6C328"
                              : consultation.status === "MISSED"
                              ? "#F54337"
                              : "#64AF64",
                        }}
                      >
                        {consultation.status.charAt(0).toUpperCase() +
                          consultation.status.slice(1).toLowerCase()}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {consultation.status === "CANCELLED" ? null : (
                        <Box sx={{ display: "flex", gap: 2 }}>
                          <a
                            href={consultation.rescheduleUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              variant="outlined"
                              sx={{
                                textTransform: "none",
                                borderColor: "black",
                                borderRadius: "15px",
                                color: "black",
                              }}
                            >
                              Reschedule
                            </Button>
                          </a>
                          <a
                            href={consultation.joinUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Button
                              sx={{
                                backgroundColor: "#F6C328",
                                color: "black",
                                textTransform: "none",
                                borderRadius: "15px",
                              }}
                            >
                              Join Now
                            </Button>
                          </a>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No Consultations found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <TablePagination
        component="div"
        count={totalCount ?? 0}
        page={currentPage}
        rowsPerPage={currentLimit}
        onPageChange={handleChangePage}
        rowsPerPageOptions={[5, 10, 15]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Paper>
  );
};

export default ConsultationsTable;
