import React, { useState } from "react";
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
  Box,
  MenuItem,
  Tooltip,
} from "@mui/material";
import { AllLeads } from "../../../features/admin/leadManagement/leadManagementTypes";
import { formatDate } from "../../../utils/FormateDate";
import { useNavigate } from "react-router-dom";
import ExportToExcelButton from "../../../components/ExportToExcelButton";
import { downloadLeadsReport } from "../../../features/admin/leadManagement/leadManagementApi";

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface LeadTableProps {
  data: AllLeads[];
  pagination?: PaginationData;
  sort?: string; // Add this
  onSortChange?: (sort: string) => void; // Add this
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (limit: number) => void;
}

const LeadTable: React.FC<LeadTableProps> = ({
  data,
  pagination,
  sort = "-createdAt", // Add this
  onSortChange, // Add this
  onPageChange,
  onRowsPerPageChange,
}) => {
  const [internalPage, setInternalPage] = useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] = useState(5);
  const navigate = useNavigate();

  const handleNavigation = (row: AllLeads) => {
    // console.log(row)
    navigate(`/admin/leadmanagement/${row._id}`);
  };

  // Handle page change
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

  const handleSortChange = (event: any) => {
    const selectedValue = event.target.value;
    const newSort =
      selectedValue === "Oldest First" ? "createdAt" : "-createdAt";
    if (onSortChange) {
      onSortChange(newSort);
    }
  };

  const currentPage = pagination ? pagination.page - 1 : internalPage;
  const currentLimit = pagination ? pagination.limit : internalRowsPerPage;
  const totalCount = pagination ? pagination.total : data.length;

  const displayData = pagination
    ? data
    : data.slice(
        currentPage * currentLimit,
        currentPage * currentLimit + currentLimit
      );

  const handleExportToExcel = async (startDate: string, endDate: string) => {
    try {
      await downloadLeadsReport(startDate, endDate);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          // gap:1
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: "bolder", mb: 1 }}>
          Lead Management
        </Typography>
        <Box display={"flex"} alignItems={"center"} gap={3}>
          <ExportToExcelButton onDownload={handleExportToExcel} />
          <Select
            value={sort === "createdAt" ? "Oldest First" : "Newest First"}
            onChange={handleSortChange}
            displayEmpty
            sx={{ mb: 1, float: "right" }}
          >
            <MenuItem value="Newest First">Newest First</MenuItem>
            <MenuItem value="Oldest First">Oldest First</MenuItem>
          </Select>
        </Box>
      </Box>

      {/* Desktop Table View */}
      <Box display={{ xs: "none", md: "block" }}>
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table>
            <TableHead>
              <TableRow>
                {[
                  "Name",
                  "Email",
                  "Phone Number",
                  "Submission Date",
                  "Priority",
                  "Action",
                ].map((header) => (
                  <TableCell key={header} sx={{ color: "#8D8883" }}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((lead, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {lead.fullName}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {lead.email}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {lead.phone}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    {formatDate(lead.createdAt)}
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Typography
                      sx={{
                        color:
                          lead?.additionalInfo?.priority === "HIGH"
                            ? "red"
                            : lead?.additionalInfo?.priority === "MEDIUM"
                            ? "orange"
                            : "green",
                      }}
                    >
                      {lead?.additionalInfo?.priority
                        ?.toLowerCase()
                        .replace(/^./, (c: any) => c.toUpperCase())}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ borderBottom: "none" }}>
                    <Button
                      sx={{ color: "black", textTransform: "none" }}
                      onClick={() => handleNavigation(lead)}
                    >
                      View &gt;
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalCount}
            page={currentPage}
            rowsPerPage={currentLimit}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 15]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </TableContainer>
      </Box>

      {/* Mobile Card View */}
      <Box display={{ xs: "block", md: "none" }}>
        {displayData.map((lead, index) => (
          <Paper
            key={index}
            sx={{
              p: 2,
              my: 2,
              border: "1px solid black",
              borderRadius: "12px",
            }}
          >
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600}>Name</Typography>
              <Typography>{lead.fullName}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600}>Email</Typography>
              <Typography>
                <Tooltip title={lead.email}>
                  <Box
                    component="span"
                    sx={{
                      maxWidth: 150,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      display: "inline-block",
                    }}
                  >
                    {lead.email}
                  </Box>
                </Tooltip>
              </Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600}>Phone</Typography>
              <Typography>{lead.phone}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600}>Submission Date</Typography>
              <Typography>{formatDate(lead.createdAt)}</Typography>
            </Box>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Typography fontWeight={600}>Priority</Typography>
              <Typography
                sx={{
                  color:
                    lead?.additionalInfo?.priority === "HIGH"
                      ? "red"
                      : lead?.additionalInfo?.priority === "MEDIUM"
                      ? "orange"
                      : "green",
                }}
              >
                {lead?.additionalInfo?.priority
                  ?.toLowerCase()
                  .replace(/^./, (c: any) => c.toUpperCase())}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                mt: 2,
                textTransform: "none",
                borderRadius: "10px",
                color: "black",
                borderColor: "black",
              }}
              onClick={() => handleNavigation(lead)}
            >
              View &gt;
            </Button>
          </Paper>
        ))}
        <TablePagination
          component="div"
          count={totalCount}
          page={currentPage}
          rowsPerPage={currentLimit}
          onPageChange={handleChangePage}
          rowsPerPageOptions={[5, 10, 15]}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Box>
    </Paper>
  );
};

export default LeadTable;
