import React, { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Select,
  MenuItem,
  TextField,
  useTheme,
  useMediaQuery,
  Tooltip,
  CircularProgress,
  FormControl,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import AddEmployeeDrawer from "../../../features/admin/RoleandPermission/component/AddEmployeeDrawer";
import {
  useDeleteAdminUserMutation,
  useEditAdminUserMutation,
  useFetchAllRolesQuery,
} from "../../../features/admin/RoleandPermission/roleAndPermissionApi";
import { toast } from "react-toastify";
import { Cancel, Save } from "@mui/icons-material";

interface Employee {
  // lastName: ReactNode;
  id: string;
  employeeId: string;
  name: string;
  roleName: string;
  phone: string;
  email: string;
}
interface Props {
  admins: {
    _id: string;
    email: string;
    name?: string;
    phone?: string;
    employeeId: string;
    roleInfo: {
      roleName: string;
    };
  }[];
  refetchAllAdminUsers: () => void;
  isLoadingAdminUsers: boolean;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  searchPagination: {
    page: number;
    limit: number;
    search: string;
  };
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  setSearch: (search: string) => void;
}

const AllEmployee = ({
  admins,
  refetchAllAdminUsers,
  isLoadingAdminUsers,
  pagination,
  searchPagination,
  setPage,
  setLimit,
  setSearch,
}: Props) => {
  // const [sortBy, setSortBy] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [employeeDrawerOpen, setEmployeeDrawerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedEmployee, setEditedEmployee] = useState<Partial<Employee>>({});
  // console.log(admins)

  const { data: roles } = useFetchAllRolesQuery(undefined);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [deleteAdminUser] = useDeleteAdminUserMutation();
  const [editAdminUser] = useEditAdminUserMutation();

  const employeeData: Employee[] = admins.map((user) => {
    // const [firstName, ...rest] = (user.name || "-").split(" ");
    return {
      id: user._id,
      name: user.name || "-",
      roleName: user.roleInfo?.roleName || "N/A",
      phone: user.phone || "-",
      email: user.email || "-",
      employeeId: user.employeeId || "-",
    };
  });

  const currentData = employeeData;

  const handleFieldChange = (field: keyof Employee, value: string) => {
    setEditedEmployee((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handleSave = async () => {
    if (!editingId) return;
    const original = employeeData.find((emp) => emp.id === editingId);
    if (!original) return;

    const updatedFields: any = {};
    for (const key in editedEmployee) {
      if (
        editedEmployee[key as keyof Employee] !==
        original[key as keyof Employee]
      ) {
        updatedFields[key] = editedEmployee[key as keyof Employee];
      }
    }

    if (Object.keys(updatedFields).length === 0) {
      toast.info("No changes detected.");
      return;
    }

    try {
      await editAdminUser({
        employeeId: editingId,
        body: updatedFields,
      }).unwrap();
      toast.success("Employee updated!");
      setEditingId(null);
      setEditedEmployee({});
      refetchAllAdminUsers();
    } catch (err) {
      toast.error("Failed to update.");
    }
  };

  const handleEditRowClick = (employee: Employee) => {
    setEditingId(employee.id);
    setEditedEmployee({ ...employee });
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = currentData.map((row) => row.id);
      setSelectedIds(newSelected);
    } else {
      setSelectedIds([]);
    }
  };

  const handleCheckboxChange = (id: string) => {
    const updatedSelected = selectedIds.includes(id)
      ? selectedIds.filter((selectedId) => selectedId !== id)
      : [...selectedIds, id];
    setSelectedIds(updatedSelected);
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage + 1); // Convert from 0-based to 1-based
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLimit(parseInt(event.target.value, 10));
    setPage(1); // Reset to first page
  };

  const handleDeleteUser = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteAdminUser(id).unwrap();
      refetchAllAdminUsers();
      toast.success("Successfully deleted adminUser!");
    } catch (error) {
      toast.error("Something went wrong while deleting");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoadingAdminUsers)
    return (
      <div className="ml-[40%] md:ml-[50%] mt-[60%] md:mt-[20%]">
        <CircularProgress />
      </div>
    );

  return (
    <Box p={{ md: 1 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <Box display={"flex"} gap={2} alignItems="center">
          {/* <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            displayEmpty
            size="small"
          >
            <MenuItem value="">Sort By</MenuItem>
            <MenuItem value="name">Name</MenuItem>
            <MenuItem value="role">Role</MenuItem>
          </Select> */}
          <TextField
            placeholder="Search employees..."
            value={searchPagination.search}
            onChange={handleSearchChange}
            size="small"
            sx={{ minWidth: 200 }}
          />
        </Box>
        <Button
          variant="contained"
          onClick={() => setEmployeeDrawerOpen(true)}
          sx={{
            textTransform: "none",
            borderRadius: 20,
            backgroundColor: "#FFC107",
            color: "#000",
            boxShadow: "none",
          }}
        >
          Add New Employee
        </Button>
      </Box>

      {isMobile ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {currentData.map((employee) => {
            const isEditing = editingId === employee.id;
            return (
              <Paper
                key={employee.id}
                sx={{
                  p: 2,
                  boxShadow: "none",
                  border: "1px solid black",
                  borderRadius: "12px",
                  my: 1,
                }}
              >
                {/* ID row */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  mb={2}
                >
                  <Box>
                    <span className="font-bold"> Employee ID:</span>{" "}
                    {employee.employeeId}
                  </Box>
                </Box>

                {/* Fields */}
                {["name", "role", "phone", "email"].map((field) => {
                  const value =
                    (isEditing ? editedEmployee : employee)[
                      field as keyof Employee
                    ] || "-";
                  if (field === "email")
                    return (
                      <Box
                        key={field}
                        display="flex"
                        alignItems="center"
                        mb={1}
                        sx={{ gap: 1 }}
                      >
                        <Box
                          sx={{
                            fontWeight: "bold",
                            flexShrink: 0,
                            minWidth: "80px",
                            textTransform: "capitalize",
                          }}
                        >
                          {field.replace(/([A-Z])/g, " $1")}:
                        </Box>
                        <Tooltip title={value} arrow>
                          <Box
                            sx={{
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              flex: 1,
                            }}
                          >
                            {value}
                          </Box>
                        </Tooltip>
                      </Box>
                    );
                  return (
                    <Box
                      key={field}
                      display="flex"
                      alignItems="center"
                      mb={1}
                      sx={{ gap: 1 }}
                    >
                      <Box
                        sx={{
                          fontWeight: "bold",
                          flexShrink: 0,
                          minWidth: "80px",
                          textTransform: "capitalize",
                        }}
                      >
                        {field.replace(/([A-Z])/g, " $1")}:
                      </Box>
                      {isEditing ? (
                        <TextField
                          fullWidth
                          size="small"
                          value={value}
                          onChange={(e) =>
                            handleFieldChange(
                              field as keyof Employee,
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <Tooltip title={value} arrow>
                          <Box
                            sx={{
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              textOverflow: "ellipsis",
                              flex: 1,
                            }}
                          >
                            {value}
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  );
                })}

                {/* Actions at Bottom */}
                <Box
                  mt={2}
                  display="flex"
                  justifyContent="space-evenly"
                  gap={1}
                >
                  {isEditing ? (
                    <>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => {
                          setEditingId(null);
                          setEditedEmployee({});
                        }}
                        startIcon={<Cancel />}
                        sx={{
                          borderRadius: "15px",
                          color: "red",
                          textTransform: "none",
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="outlined"
                        color="success"
                        onClick={handleSave}
                        startIcon={<Save />}
                        sx={{
                          borderRadius: "15px",
                          textTransform: "none",
                          color: "green",
                          bgcolor: "white",
                        }}
                      >
                        Save
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeleteUser(employee.id)}
                        disabled={!!editingId || deletingId === employee.id}
                        startIcon={<DeleteOutlinedIcon />}
                        sx={{
                          borderRadius: "15px",
                          color: "red",
                          textTransform: "none",
                        }}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="outlined"
                        onClick={() => handleEditRowClick(employee)}
                        disabled={!!editingId}
                        startIcon={<EditIcon />}
                        sx={{
                          borderColor: "black",
                          borderRadius: "15px",
                          color: "black",
                          textTransform: "none",
                        }}
                      >
                        Edit
                      </Button>
                    </>
                  )}
                </Box>
              </Paper>
            );
          })}
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ boxShadow: "none" }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={currentData.every((row) =>
                      selectedIds.includes(row.id)
                    )}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>Employee ID</TableCell>
                <TableCell>Name</TableCell>
                {/* <TableCell>Last Name</TableCell> */}
                <TableCell>Role</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentData.map((employee) => {
                const isEditing = editingId === employee.id;
                return (
                  <TableRow
                    key={employee.id}
                    // onClick={() => !editingId && handleEditRowClick(employee)}
                  >
                    <TableCell padding="checkbox" sx={{ borderBottom: "none" }}>
                      <Checkbox
                        checked={selectedIds.includes(employee.id)}
                        onChange={() => handleCheckboxChange(employee.id)}
                        disabled={!!editingId && editingId !== employee.id}
                      />
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {employee.employeeId}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {isEditing ? (
                        <TextField
                          value={editedEmployee.name || ""}
                          onChange={(e) =>
                            handleFieldChange("name", e.target.value)
                          }
                          size="small"
                          fullWidth
                        />
                      ) : (
                        employee.name
                      )}
                    </TableCell>
                    {/* <TableCell sx={{ borderBottom: "none" }}>
                      {isEditing ? (
                        <TextField
                          value={editedEmployee.name || ""}
                          onChange={(e) =>
                            handleFieldChange("lastName", e.target.value)
                          }
                          size="small"
                          fullWidth
                        />
                      ) : (
                        employee.lastName
                      )}
                    </TableCell> */}
                    <TableCell sx={{ borderBottom: "none" }}>
                      {isEditing ? (
                        <FormControl fullWidth size="small">
                          <Select
                            value={editedEmployee.roleName || ""}
                            onChange={(e) =>
                              handleFieldChange("roleName", e.target.value)
                            }
                            displayEmpty
                          >
                            {roles?.roles?.map((role: any) => (
                              <MenuItem key={role._id} value={role.roleName}>
                                {role.roleName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      ) : (
                        employee.roleName || "N/A"
                      )}
                    </TableCell>

                    <TableCell sx={{ borderBottom: "none" }}>
                      {isEditing ? (
                        <TextField
                          value={editedEmployee.phone || ""}
                          onChange={(e) =>
                            handleFieldChange("phone", e.target.value)
                          }
                          size="small"
                          fullWidth
                        />
                      ) : (
                        employee.phone
                      )}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {employee.email}
                    </TableCell>
                    <TableCell sx={{ borderBottom: "none" }}>
                      {isEditing ? (
                        <Box display={"flex"}>
                          <IconButton
                            color="error"
                            onClick={() => {
                              setEditingId(null);
                              setEditedEmployee({});
                            }}
                            size="small"
                          >
                            <Cancel />
                          </IconButton>
                          <IconButton
                            onClick={handleSave}
                            color="success"
                            size="small"
                          >
                            <Save />
                          </IconButton>
                        </Box>
                      ) : (
                        <>
                          <IconButton
                            onClick={() => handleEditRowClick(employee)}
                            disabled={!!editingId}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteUser(employee.id)}
                            disabled={!!editingId || deletingId === employee.id}
                          >
                            <DeleteOutlinedIcon fontSize="small" />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={pagination?.total || 0}
        page={(pagination?.page || 1) - 1} // Convert to 0-based
        onPageChange={handleChangePage}
        rowsPerPage={pagination?.limit || 10}
        rowsPerPageOptions={[5, 10, 25]}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />

      <AddEmployeeDrawer
        refetchAllAdminUsers={refetchAllAdminUsers}
        open={employeeDrawerOpen}
        onClose={() => setEmployeeDrawerOpen(false)}
      />
    </Box>
  );
};

export default AllEmployee;
