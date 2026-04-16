import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  // MenuItem,
  // Select,
  // SelectChangeEvent,
  useTheme,
  useMediaQuery,
  CircularProgress,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useState } from "react";
import {
  useFetchRoleWisePermissionsQuery,
  useEditRoleNameMutation,
  useDeleteRoleMutation,
} from "../../../features/admin/RoleandPermission/roleAndPermissionApi";
import ManagePermissionsDrawer from "../../../features/admin/RoleandPermission/component/ManagePermissionsDrawer";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { toast } from "react-toastify";

const ManageRoles = () => {
  // const [sortBy, setSortBy] = useState("name");
  const [openPermissions, setOpenPermissions] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    undefined
  );
  const [selectedRoleId, setSelectedRoleId] = useState<string | undefined>(
    undefined
  );
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [isAdding, setIsAdding] = useState<boolean>();
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editedRoleName, setEditedRoleName] = useState<string>("");
  const [deletingRoleId, setDeletingRoleId] = useState<string | null>(null);

  const theme = useTheme();
  const isBelowLg = useMediaQuery(theme.breakpoints.down("lg"));

  const {
    data: rolePermissions,
    isLoading: loadingRoles,
    error: errorRoles,
    refetch,
  } = useFetchRoleWisePermissionsQuery(undefined);

  const [deleteRole] = useDeleteRoleMutation();
  const [editRoleName] = useEditRoleNameMutation();

  if (loadingRoles)
    return (
      <div className="ml-[40%] md:ml-[50%] mt-[60%] md:mt-[20%]">
        <CircularProgress />
      </div>
    );
  if (errorRoles) return <Typography>Error loading data</Typography>;

  // const handleSortChange = (event: SelectChangeEvent) => {
  //   setSortBy(event.target.value);
  // };

  const sortedRolePermissions = [...(rolePermissions || [])].sort((a, b) => {
    return a.roleName.localeCompare(b.roleName);
  });

  const handleDeleteRole = async (roleId: string) => {
    setDeletingRoleId(roleId);
    try {
      await deleteRole(roleId).unwrap();
      toast.success("Deleted Role successfully!");
      refetch();
    } catch (err) {
      toast.error("Something went wrong. Try again!");
      console.error("Failed to delete role:", err);
    } finally {
      setDeletingRoleId(null);
    }
  };

  return (
    <>
      <Box p={{ md: 3 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          {/* <Select
            value={sortBy}
            onChange={handleSortChange}
            // startAdornment={<SortIcon />}
            size="small"
            // sx={{ minWidth: 150 }}
          >
            <MenuItem value="name">Sort By</MenuItem>
          </Select> */}
          <Button
            onClick={() => {
              setSelectedRole(undefined);
              setOpenPermissions(true);
              setSelectedFeatures([]);
              setIsAdding(true);
            }}
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              color: "#000",
              borderRadius: 20,
              textTransform: "none",
              boxShadow: "none",
            }}
          >
            Add New Role
          </Button>
        </Box>

        {sortedRolePermissions.map((role) => (
          <Paper
            key={role.roleId}
            elevation={1}
            sx={{
              opacity: deletingRoleId === role.roleId ? 0.5 : 1,
              pointerEvents: deletingRoleId === role.roleId ? "none" : "auto",
              transition: "opacity 0.3s ease",
              p: 2,
              mb: 3,
              bgcolor: "#f9f9f9",
            }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography
                variant="h6"
                fontWeight="bold"
                sx={{ cursor: "pointer", minWidth: 120 }}
                onClick={() => {
                  setEditingRoleId(role.roleId);
                  setEditedRoleName(role.roleName);
                }}
              >
                {editingRoleId === role.roleId ? (
                  <input
                    autoFocus
                    value={editedRoleName}
                    onChange={(e) => setEditedRoleName(e.target.value)}
                    onBlur={async () => {
                      if (
                        editedRoleName.trim() &&
                        editedRoleName !== role.roleName
                      ) {
                        try {
                          const body = {
                            roleName: editedRoleName.trim(),
                          };
                          await editRoleName({
                            roleId: role.roleId,
                            body,
                          }).unwrap();
                          toast.success("Role name channged successfully!");
                          refetch();
                        } catch (error) {
                          toast.error("Something went wrong. Try again!");
                          console.error("Failed to edit role name:", error);
                        }
                      }
                      setEditingRoleId(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        (e.target as HTMLInputElement).blur();
                      }
                    }}
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "bold",
                      border: "none",
                      borderBottom: "1px solid gray",
                      outline: "none",
                      backgroundColor: "transparent",
                      width: "100%",
                    }}
                  />
                ) : (
                  role.roleName
                )}
              </Typography>

              <Box>
                {role.isEditable && (
                  <>
                    <IconButton
                      onClick={() => {
                        setSelectedRole(role.roleName);
                        setSelectedFeatures(role.features);
                        setSelectedRoleId(role.roleId);
                        setOpenPermissions(true);
                        setIsAdding(false);
                      }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteRole(role.roleId)}>
                      <DeleteOutlinedIcon color="error" fontSize="small" />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {(role.features || []).length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No features assigned
              </Typography>
            ) : (
              role.features.map((feature: any) => (
                <Box
                  key={feature.featureId}
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                  p={1}
                  borderRadius={2}
                  border="1px solid #ddd"
                  mb={1}
                  bgcolor="white"
                >
                  <Typography variant="body2" color="text.secondary">
                    {isBelowLg ? (
                      <>
                        {feature.actions.map((a: any, idx: number) => (
                          <Box key={idx}>
                            {a.action.split(/(?=[A-Z])/).join(" ")}
                          </Box>
                        ))}
                      </>
                    ) : (
                      feature.actions
                        .map((a: any) => a.action.split(/(?=[A-Z])/).join(" "))
                        .join(" / ")
                    )}
                  </Typography>

                  <Typography variant="body2" fontWeight={500}>
                    {feature.name}
                  </Typography>
                </Box>
              ))
            )}
          </Paper>
        ))}
      </Box>
      <ManagePermissionsDrawer
        selectedRole={selectedRole}
        selectedFeatures={selectedFeatures}
        open={openPermissions}
        onClose={() => {
          setSelectedFeatures([]);
          setOpenPermissions(false);
        }}
        isAdding={isAdding}
        refetchAllFeatures={refetch}
        selectedRoleId={selectedRoleId}
      />
    </>
  );
};

export default ManageRoles;
