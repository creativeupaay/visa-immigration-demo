import {
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import { useFetchAdminProfileQuery } from "../../../features/admin/adminProfile/adminProfileApi";

const getInitials = (name: string) =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

const AdminProfile = () => {
  const { data, isLoading, error } = useFetchAdminProfileQuery(undefined);

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" mt={6}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !data?.user) {
    return (
      <Box mt={6} textAlign="center" color="error.main">
        Failed to load profile.
      </Box>
    );
  }

  const { user } = data;

  return (
    <Box sx={{ mt: { xs: 2, md: 6 }, mx: { md: 5 } }}>
      <Paper elevation={3} sx={{ p: { xs: 1, md: 4 }, borderRadius: "15px" }}>
        {/* Main layout container */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", md: "row" }}
          alignItems={{ xs: "center", md: "flex-start" }}
          gap={4}
        >
          {/* Avatar */}
          <Avatar
            sx={{
              bgcolor: "#F6C229",
              width: 80,
              height: 80,
              fontSize: 32,
              color: "black",
            }}
          >
            {getInitials(user.name)}
          </Avatar>

          {/* Profile info */}
          <Box flex={1} width="100%">
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{
                display: "flex",
                justifyContent: { xs: "center", md: "start" },
                my: 2,
              }}
              gutterBottom
            >
              Admin Profile
            </Typography>

            {/* Info rows */}
            <Box display="flex" flexWrap="wrap" gap={2}>
              {[
                { label: "Name", value: user.name },
                { label: "Email", value: user.email },
                { label: "Phone", value: user.phone },
                { label: "Nationality", value: user.nationality },
                { label: "Status", value: user.UserStatus },
                { label: "Role", value: user.role },
                { label: "Employee ID", value: user.employeeId },
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  width={{ xs: "100%", sm: "48%" }}
                  bgcolor="#f9f9f9"
                  p={2}
                  borderRadius={2}
                >
                  <Tooltip title={value || "-"} arrow>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      }}
                    >
                      <strong>{label}:</strong> {value}
                    </Typography>
                  </Tooltip>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminProfile;
