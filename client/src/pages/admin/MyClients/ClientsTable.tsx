import React, { useMemo, useState } from "react";
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
  Modal,
  TextField,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import countryList from "react-select-country-list";
import ReactSelect from "react-select";
import { toast } from "react-toastify";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import ExportToExcelButton from "../../../components/ExportToExcelButton";
import { downloadClientsReport } from "../../../features/admin/myClients/myClientsApi";

const modalStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: 400, md: 800 },
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 2,
  p: 4,
};

const customStyles = {
  control: (base: any) => ({
    ...base,
    padding: "9px 10px", // y = 6px, x = 10px
    minHeight: "40px",
  }),
  menu: (base: any) => ({
    ...base,
    zIndex: 9999,
  }),
};

interface TableProps {
  data: any[] | undefined;
  onAddClient: any;
  refetch: () => void;
  searchInput: string;
  setSearchInput: (query: string) => void;
  searchPaginationState: any;
  searchPaginationActions: any;
  pagination: any;
}

const ClientsTable: React.FC<TableProps> = ({
  data,
  onAddClient,
  refetch,
  searchInput,
  setSearchInput,
  searchPaginationState,
  searchPaginationActions,
  pagination,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    serviceType: "",
    nationality: "",
    amount: "",
    currency: "",
  });

  const countryOptions = useMemo(() => countryList().getData(), []);

  const navigate = useNavigate();

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name!]: value }));
  };

  const handleAddClient = async () => {
    // console.log("Form Data:", formData,selectedFile);
    try {
      setIsLoading(true);
      await onAddClient({ data: formData, file: selectedFile }).unwrap();
      toast.success("Client added successfully!");
      refetch();
    } catch (err) {
      console.error("Failed to add client:", err);
      toast.error("Failed to add client.");
    } finally {
      setFormData({
        name: "",
        email: "",
        phone: "",
        serviceType: "",
        nationality: "",
        amount: "",
        currency: "",
      });
      setIsLoading(false);
      setOpenModal(false);
      setSelectedFile(null);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    searchPaginationActions.setPage(newPage + 1);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    searchPaginationActions.setLimit(parseInt(event.target.value, 10));
  };

  const handleExportToExcel = async (startDate: string, endDate: string) => {
    try {
      await downloadClientsReport(startDate, endDate);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
    }
  };

  return (
    <>
      <Paper sx={{ p: 2, boxShadow: "none" }}>
        {/* Filters */}
        <Box
          sx={{
            display: { xs: "block", md: "flex" },
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Stack direction="row" alignItems={"center"} gap={2}>
            <Typography variant="h6" sx={{ fontWeight: "bolder", mb: 2 }}>
              My Clients
            </Typography>
            <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
              <TextField
                placeholder="Search clients..."
                size="small"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                sx={{ minWidth: 200 }}
              />
            </Box>
          </Stack>

          <Box
            sx={{
              display: { xs: "block", md: "flex" },
              gap: { xs: 1, md: 5 },
              mb: 1,
            }}
          >
            <ExportToExcelButton onDownload={handleExportToExcel} />
            <Button
              sx={{
                textTransform: "none",
                borderRadius: "20px",
                bgcolor: "#F6C328",
                color: "#282827",
                my: { xs: 2, md: 1 },
                px: 2,
              }}
              onClick={() => setOpenModal(true)}
            >
              Add New Client
            </Button>
          </Box>
        </Box>

        {/* Table */}
        {!isSmallScreen ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Name",
                    "Case ID",
                    "Last Service",
                    "Starting Date",
                    "Total Revenue",
                    "Status",
                    "Action",
                  ].map((header) => (
                    <TableCell key={header} sx={{ color: "#8D8883" }}>
                      {header}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data?.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {client.name}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {client.caseId}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {client.lastService}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {client.startingDate}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {client.totalRevenue}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Typography
                        sx={{
                          color:
                            client.status === "Application Approved"
                              ? "#64AE65"
                              : "#F6C328",
                        }}
                      >
                        {client.status}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      <Button
                        sx={{
                          color: "black",
                          textTransform: "none",
                          marginLeft: "10px",
                        }}
                        onClick={() =>
                          navigate(`/admin/myclient/${client.userId}`)
                        }
                      >
                        View &gt;
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          // Card ui for mobile screens
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            {data?.map((client) => (
              <Card
                key={client._id}
                variant="outlined"
                sx={{
                  border: "1px solid black",
                  borderRadius: "15px",
                }}
              >
                <CardContent>
                  {[
                    { label: "Name", value: client.name },
                    { label: "Case ID", value: client.caseId },
                    { label: "Last Service", value: client.lastService },
                    { label: "Starting Date", value: client.startingDate },
                    { label: "Total Revenue", value: client.totalRevenue },
                    { label: "Status", value: client.status },
                  ].map((field, idx) => (
                    <Box
                      key={idx}
                      display="flex"
                      justifyContent="space-between"
                      py={0.5}
                    >
                      <Typography fontWeight="bold">{field.label}</Typography>
                      <Typography
                        color={
                          field.label === "Status"
                            ? client.status === "Application Approved"
                              ? "#64AE65"
                              : "#F6C328"
                            : "text.primary"
                        }
                      >
                        {field.value}
                      </Typography>
                    </Box>
                  ))}
                  {/* <Divider sx={{ my: 1 }} /> */}
                  <Box display="flex" justifyContent="flex-end">
                    <Button
                      onClick={() =>
                        navigate(`/admin/myclient/${client.userId}`)
                      }
                      variant="outlined"
                      fullWidth
                      sx={{
                        mt: 2,
                        textTransform: "none",
                        borderRadius: "10px",
                        color: "black",
                        borderColor: "black",
                      }}
                    >
                      View &gt;
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 15]}
          component="div"
          count={pagination?.total || 0}
          rowsPerPage={searchPaginationState.limit}
          page={searchPaginationState.page - 1} // Convert to 0-based for UI
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      {/* Add client Modal */}
      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box sx={modalStyle}>
          <Typography variant="h6" mb={2} textAlign="center" fontWeight="bold">
            Add a New Client
          </Typography>

          {/* First Row */}
          <Box display="flex" gap={2} mb={2}>
            <TextField
              fullWidth
              label="Enter Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Enter Email ID"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              fullWidth
              label="Enter Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
            />
          </Box>

          {/* Second Row */}
          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel>Service Taken</InputLabel>
              <Select
                name="serviceType"
                value={formData.serviceType}
                label="Service Taken"
                onChange={(e: any) => handleInputChange(e)}
              >
                <MenuItem value="Dominica">Dominica Passport</MenuItem>
                <MenuItem value="Grenada">Grenada Passport</MenuItem>
                <MenuItem value="Portugal">Portugal D7 Visa</MenuItem>
                <MenuItem value="Dubai">Dubai Residency</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <Box>
                <ReactSelect
                  styles={customStyles}
                  options={countryOptions}
                  value={countryOptions.find(
                    (c: any) => c.label === formData.nationality
                  )}
                  onChange={(selectedOption) =>
                    setFormData({
                      ...formData,
                      nationality: selectedOption?.label || "",
                    })
                  }
                />
              </Box>
            </FormControl>
          </Box>

          <Box display="flex" gap={2} mb={2}>
            <FormControl fullWidth>
              <InputLabel>Currency Type</InputLabel>
              <Select
                name="currency"
                value={formData.currency}
                label="Currency Type"
                onChange={(e: any) => handleInputChange(e)}
              >
                <MenuItem value="inr">₹ (INR)</MenuItem>
                <MenuItem value="usd">$ (USD)</MenuItem>
                <MenuItem value="eur">€ (EUR)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Charged Amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
            />
          </Box>

          {/* ✅ File Upload Section */}
          <Box
            display={{ xs: "block", md: "flex" }}
            alignItems="center"
            gap={2}
            mb={2}
          >
            <Button
              variant="outlined"
              component="label"
              sx={{
                color: "black",
                border: "1px solid gray",
                borderRadius: "20px",
                px: 3,
                textTransform: "none",
                mb: { xs: 2, md: 0 },
              }}
              startIcon={<FileUploadIcon sx={{ color: "black" }} />}
            >
              Upload Payment Invoice
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setSelectedFile(file);
                  }
                }}
              />
            </Button>
            <Typography variant="body2" sx={{ mb: { xs: 2, md: 0 } }}>
              {selectedFile ? selectedFile.name : "No file selected"}
            </Typography>
          </Box>

          {/* Buttons */}
          <Box display="flex" justifyContent="center" gap={2} mt={2}>
            <Button
              onClick={() => setOpenModal(false)}
              sx={{
                color: "black",
                border: "1px solid gray",
                borderRadius: "20px",
                px: 4,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddClient}
              disabled={
                !formData.name ||
                !formData.email ||
                !formData.phone ||
                !formData.serviceType ||
                !formData.nationality ||
                !formData.amount ||
                !selectedFile ||
                isLoading === true
              }
              sx={{
                boxShadow: "none",
                borderRadius: "20px",
                px: 5,
                textTransform: "none",
              }}
            >
              {isLoading ? "Adding client..." : "Add client"}
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default ClientsTable;
