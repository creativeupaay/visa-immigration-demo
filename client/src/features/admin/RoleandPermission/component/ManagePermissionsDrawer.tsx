import { useEffect, useState } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Checkbox,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import {
  useAddNewRoleMutation,
  useAssignActionsToRoleMutation,
  useFetchAllFeaturesQuery,
} from "../roleAndPermissionApi";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import { toast } from "react-toastify";

interface Props {
  open: boolean;
  onClose: () => void;
  selectedRole?: string;
  selectedRoleId?: string;
  selectedFeatures?: any[];
  isAdding: boolean | undefined;
  refetchAllFeatures?: () => void;
  refetchAllRoles?: () => void;
  onRoleCreated?: (id: string) => void
}

const ManagePermissionsDrawer = ({
  open,
  onClose,
  selectedRole,
  selectedRoleId,
  selectedFeatures,
  isAdding,
  refetchAllFeatures,
  refetchAllRoles,
  onRoleCreated
}: Props) => {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [roleName, setRoleName] = useState(selectedRole ?? "");
  const [initialPermissions, setInitialPermissions] = useState<string[]>([]);

  const { data, isLoading, error } = useFetchAllFeaturesQuery(undefined);

  const [addNewRole, { isLoading: isSaving }] = useAddNewRoleMutation();

  const [assignActionsToRole, { isLoading: isAssigning }] =
    useAssignActionsToRoleMutation();

  useEffect(() => {
    if (open) {
      setRoleName(selectedRole ?? "");

      if (selectedFeatures && selectedFeatures.length > 0) {
        const perms = selectedFeatures.flatMap((feature: any) =>
          feature.actions.map((a: any) => a.actionId)
        );
        setInitialPermissions(perms);
        setSelectedPermissions(perms);
      } else {
        setInitialPermissions([]);
        setSelectedPermissions([]);
      }
    }
  }, [open, selectedRole, selectedFeatures]);

  const buttonName = isAdding === true ? "+ Add new role" : "Save changes";
  const flattenedPermissions =
    data?.features.flatMap((feature: any) =>
      feature.actions.map((action: any) => ({
        id: action._id,
        name: action.action,
        function: feature.name,
      }))
    ) || [];

  const handleToggle = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId)
        ? prev.filter((id) => id !== permId)
        : [...prev, permId]
    );
  };

  const filteredPermissions = flattenedPermissions.filter(
    (p: any) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.function.toLowerCase().includes(search.toLowerCase())
  );
  useEffect(() => {
    if (open) {
      setRoleName(selectedRole ?? "");

      if (selectedFeatures && selectedFeatures.length > 0) {
        const initialPermissions = selectedFeatures.flatMap((feature: any) =>
          feature.actions.map((a: any) => a.actionId)
        );
        setSelectedPermissions(initialPermissions);
      } else {
        setSelectedPermissions([]);
      }
    }
  }, [open, selectedRole, selectedFeatures]);

  const handleSave = async () => {
    if (!roleName.trim()) {
      toast.error("Please enter a role name.");
      return;
    }

    if (selectedPermissions.length === 0) {
      toast.error("Please select at least one permission.");
      return;
    }

    if (isAdding) {
      try {
        const response = await addNewRole({
          name: roleName,
          actionIds: selectedPermissions,
        }).unwrap();

        console.log(response)

        toast.success("Role created successfully!");
        setRoleName("");
        setSelectedPermissions([]);
        refetchAllFeatures?.();
        refetchAllRoles?.();
        onRoleCreated?.(response.role._id);
        onClose();
      } catch (err) {
        toast.error("Error creating role");
      }
    } else {
      const addIds = selectedPermissions.filter(
        (id) => !initialPermissions.includes(id)
      );
      const deleteIds = initialPermissions.filter(
        (id) => !selectedPermissions.includes(id)
      );

      if (addIds.length === 0 && deleteIds.length === 0) {
        toast.info("No changes to save.");
        return;
      }

      try {
        await assignActionsToRole({
          roleId: selectedRoleId!,
          addIds,
          deleteIds,
        }).unwrap();

        toast.success("Permissions updated successfully!");
        refetchAllFeatures?.();
        onClose();
      } catch (err) {
        console.error("Error updating role permissions:", err);
        toast.error("Failed to update permissions.");
      }
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: 370, sm: 700, md: 1000 }, p: 3 } }}
    >
      <Box display="flex" justifyContent="space-between" mb={2}>
        <Typography variant="h6" fontWeight="bold">
          Manage Permissions
        </Typography>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box bgcolor="#f5f3f3" p={2} borderRadius={2} mb={3}>
        <Typography fontWeight={500} mb={1}>
          Role
        </Typography>
        <TextField
          fullWidth
          value={roleName}
          onChange={(e) => setRoleName(e.target.value)}
          disabled={selectedRole !== undefined}
        />
        {selectedPermissions.map((id) => {
          const perm = flattenedPermissions.find((p: any) => p.id === id);
          if (!perm) return null;
          return (
            <Box
              key={id}
              display="flex"
              flexDirection={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              gap={1}
              my={1}
              bgcolor={"white"}
              p={1}
              borderRadius={2}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <RemoveCircleIcon
                  fontSize="small"
                  color="error"
                  onClick={() => handleToggle(id)}
                  sx={{ cursor: "pointer" }}
                />
                <Typography>{perm.name}</Typography>
              </Box>
              <Typography sx={{ml:{xs:3,md:0}}}>{perm.function}</Typography>
            </Box>
          );
        })}

        <Box display="flex" justifyContent="flex-end" mt={3}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving || isAssigning}
            sx={{
              backgroundColor: "#FFC107",
              color: "#000",
              borderRadius: 8,
              textTransform: "none",
              "&:hover": { backgroundColor: "#e6b800" },
              boxShadow: "none",
              display: "flex",
              justifyContent: "end",
            }}
          >
            {isSaving || isAssigning ? "Processing..." : buttonName}
          </Button>
        </Box>
      </Box>

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by Permission or Function"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">Failed to load permissions</Typography>
      ) : (
        <Box>
          {/* Table Header with "Add All" Icon */}
          <Box display="flex" px={2} py={1} borderBottom="1px solid #e0e0e0">
            <Box flex={1} display="flex" alignItems="center" gap={1}>
              <Typography color="text.secondary" fontWeight={500}>
                Actions
              </Typography>
              <IconButton
                size="small"
                onClick={() =>
                  setSelectedPermissions(
                    flattenedPermissions.map((p: any) => p.id)
                  )
                }
              >
                <PlaylistAddCheckIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box flex={1}>
              <Typography color="text.secondary" fontWeight={500}>
                Functions
              </Typography>
            </Box>
          </Box>

          {/* Permission Rows */}
          {filteredPermissions.map((p: any) => (
            <Box
              key={p.id}
              display="flex"
              flexDirection={{ xs: "column", sm: "row" }}
              alignItems={{ xs: "flex-start", sm: "center" }}
              gap={1}
              px={2}
              py={1.5}
              borderBottom="1px solid #f0f0f0"
              sx={{ cursor: "pointer" }}
              onClick={() => handleToggle(p.id)}
            >
              {/* Checkbox + Permission Name */}
              <Box flex={1} display="flex" alignItems="center" gap={1}>
                <Checkbox
                  checked={selectedPermissions.includes(p.id)}
                  onChange={() => handleToggle(p.id)}
                  onClick={(e) => e.stopPropagation()} // Prevent event bubbling to Box
                />
                <Typography>{p.name}</Typography>
              </Box>

              {/* Function Name */}
              <Box flex={1} width="100%">
                <Typography sx={{ml:{xs:6,md:0}}}>{p.function}</Typography>
              </Box>
            </Box>
          ))}
        </Box>
      )}
    </Drawer>
  );
};

export default ManagePermissionsDrawer;
