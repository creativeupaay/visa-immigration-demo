import React, { useEffect, useState, useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Select,
  MenuItem,
  Typography,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Tooltip,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import {
  downloadInvoicesReport,
  useFetchAllInvoicesQuery,
} from "./invoicesManagementApi";
import { useSearchPagination } from "../../searchPagination/useSearchPagination";
import ExportToExcelButton from "../../../components/ExportToExcelButton";

const InvoicesManagementTable: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [localSearch, setLocalSearch] = useState<string>("");
  const searchTimeoutRef = useRef<null | number>(null);

  const [{ page, limit, search }, { setPage, setLimit, setSearch }] =
    useSearchPagination();

  const { data, isLoading, isError } = useFetchAllInvoicesQuery({
    page,
    limit,
    search,
    statusFilter,
  });

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setLocalSearch(value);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      setSearch(value);
      setPage(1);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newLimit = parseInt(event.target.value, 10);
    setLimit(newLimit);
    setPage(1);
  };

  const handleStatusFilterChange = (event: any) => {
    const value = event.target.value === "All" ? "" : event.target.value;
    setStatusFilter(value);
    setPage(1);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID":
        return "success";
      case "PENDING":
        return "warning";
      case "FAILED":
        return "error";
      default:
        return "default";
    }
  };

  const statuses = ["PENDING", "PAID", "FAILED"];

  const handleExportToExcel = async (startDate: string, endDate: string) => {
    try {
      await downloadInvoicesReport(startDate, endDate);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  const renderCardView = (row: any, index: number) => (
    <Box
      key={index}
      sx={{
        minWidth: "290px",
        border: "1px solid #e0e0e0",
        borderRadius: "15px",
        padding: 2,
        mb: 2,
        background: "#fff",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Typography sx={{ mb: 1 }}>
        <strong>Name:</strong> {row?.name || "N/A"}
      </Typography>

      <Typography sx={{ display: "flex", gap: 1, mb: 1 }}>
        <strong>Email:</strong>
        <Tooltip title={row?.email || "N/A"}>
          <Box
            component="span"
            sx={{
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              display: "inline-block",
            }}
          >
            {row?.email || "N/A"}
          </Box>
        </Tooltip>
      </Typography>

      <Typography sx={{ mb: 1 }}>
        <strong>Amount:</strong> {row?.amount || "N/A"}
      </Typography>

      <Typography sx={{ mb: 1 }}>
        <strong>Currency:</strong> {row?.currency?.toUpperCase() || "N/A"}
      </Typography>

      <Typography sx={{ mb: 1, display: "flex", alignItems: "center", gap: 1 }}>
        <strong>Status:</strong>
        <Chip
          label={row?.status || "UNKNOWN"}
          size="small"
          color={getStatusColor(row?.status)}
          variant="filled"
        />
      </Typography>

      <Box>
        <Button
          onClick={() =>
            row?.invoiceUrl && window.open(row.invoiceUrl, "_blank")
          }
          variant="outlined"
          fullWidth
          disabled={!row?.invoiceUrl}
          sx={{
            mt: 2,
            textTransform: "none",
            borderRadius: "10px",
            color: "black",
            borderColor: "black",
            "&:hover": {
              borderColor: "black",
              backgroundColor: "rgba(0,0,0,0.04)",
            },
          }}
        >
          View Invoice &gt;
        </Button>
      </Box>
    </Box>
  );

  return (
    <Paper sx={{ p: 2, boxShadow: "none" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          mb: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{ fontWeight: "bolder", mb: { xs: 2, md: 0 } }}
        >
          Invoices Management
        </Typography>

        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <ExportToExcelButton onDownload={handleExportToExcel} />
          <TextField
            placeholder="Search invoices..."
            value={localSearch}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />

          <Select
            value={statusFilter || "All"}
            onChange={handleStatusFilterChange}
            displayEmpty
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="All">All Status</MenuItem>
            {statuses.map((status: string, index: number) => (
              <MenuItem key={index} value={status}>
                {status}
              </MenuItem>
            ))}
          </Select>
        </Box>
      </Box>

      {isLoading ? (
        <Typography textAlign="center" sx={{ py: 4 }}>
          Loading invoices...
        </Typography>
      ) : isError ? (
        <Typography textAlign="center" sx={{ py: 4, color: "error.main" }}>
          Error loading invoices. Please try again.
        </Typography>
      ) : (
        <>
          {isMobile ? (
            <>
              {data?.data?.length === 0 ? (
                <Typography textAlign="center" sx={{ py: 4 }}>
                  No invoices available at the moment
                </Typography>
              ) : (
                data?.data?.map((row: any, index: number) =>
                  renderCardView(row, index)
                )
              )}
            </>
          ) : (
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table>
                <TableHead>
                  <TableRow>
                    {[
                      "Name",
                      "Email",
                      "Amount",
                      "Currency",
                      "Payment Method",
                      "Status",
                      "Source",
                      "Invoice",
                    ].map((header, index) => (
                      <TableCell
                        key={index}
                        align={header === "Invoice" ? "right" : "left"}
                        sx={{ color: "#8D8883", fontWeight: "bold" }}
                      >
                        {header}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data?.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        No invoices available at the moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    data?.data?.map((row: any, index: any) => (
                      <TableRow key={index} sx={{ borderBottom: "none" }}>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {row?.name || "N/A"}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          <Tooltip title={row?.email || "N/A"}>
                            <Box
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {row?.email || "N/A"}
                            </Box>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {row?.amount || "N/A"}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {row?.currency?.toUpperCase() || "N/A"}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {row?.paymentMethod}
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          <Chip
                            label={row?.status || "UNKNOWN"}
                            size="small"
                            color={getStatusColor(row?.status)}
                            variant="filled"
                          />
                        </TableCell>
                        <TableCell sx={{ borderBottom: "none" }}>
                          {row?.source}
                        </TableCell>
                        <TableCell align="right" sx={{ borderBottom: "none" }}>
                          <Button
                            onClick={() =>
                              row?.invoiceUrl &&
                              window.open(row.invoiceUrl, "_blank")
                            }
                            disabled={!row?.invoiceUrl}
                            sx={{
                              color: "black",
                              textTransform: "none",
                              "&:hover": {
                                backgroundColor: "rgba(0,0,0,0.04)",
                              },
                            }}
                          >
                            View &gt;
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <TablePagination
            component="div"
            count={data?.pagination?.total || 0}
            page={(page || 1) - 1}
            rowsPerPage={limit || 10}
            onPageChange={handleChangePage}
            rowsPerPageOptions={[5, 10, 15, 25]}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
    </Paper>
  );
};

export default InvoicesManagementTable;
