import { useEffect, useState } from "react";
import {
  Drawer,
  Typography,
  Box,
  TextField,
  MenuItem,
  IconButton,
  Button,
  Select,
  InputLabel,
  FormControl,
  Checkbox,
  FormControlLabel,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import ManagePermissionsDrawer from "./ManagePermissionsDrawer";
import {
  useAddNewAdminUserMutation,
  useFetchAllRolesQuery,
  useRequestOtpForEmpCreationMutation,
  useVerifyOtpForEmpCreationMutation,
} from "../roleAndPermissionApi";
import { toast } from "react-toastify";

const AddEmployeeDrawer = ({
  open,
  onClose,
  refetchAllAdminUsers,
}: {
  open: boolean;
  onClose: () => void;
  refetchAllAdminUsers: () => void;
}) => {
  // Form state
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    nationality: "",
    autoGeneratePassword: false,
  });

  // OTP state
  const [otpStep, setOtpStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Role management
  const [openPermissions, setOpenPermissions] = useState(false);
  const [newlyCreatedRoleId, setNewlyCreatedRoleId] = useState<string | null>(
    null
  );
  const { data: roles, refetch: refetchAllRoles } =
    useFetchAllRolesQuery(undefined);

  // API hooks
  const [addNewAdminUser, { isLoading: isAddingAdmin }] =
    useAddNewAdminUserMutation();
  const [requestOtp] = useRequestOtpForEmpCreationMutation();
  const [verifyOtp] = useVerifyOtpForEmpCreationMutation();

  useEffect(() => {
    if (newlyCreatedRoleId) {
      setFormData((prev) => ({ ...prev, role: newlyCreatedRoleId }));
      setNewlyCreatedRoleId(null);
    }
  }, [roles, newlyCreatedRoleId]);

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // const handleRequestOtp = async () => {
  //   if (!formData.firstName || !formData.lastName || !formData.email || !formData.role) {
  //     toast.error("Please fill all required fields.");
  //     return;
  //   }

  //   setIsSendingOtp(true);
  //   try {
  //     await requestOtp({
  //       newEmployeeEmail: formData.email
  //     }).unwrap();
  //     toast.info("OTP sent to your admin email");
  //     setOtpStep("otp");
  //   } catch (error) {
  //     toast.error("Failed to send OTP");
  //     console.error("OTP send error:", error);
  //   } finally {
  //     setIsSendingOtp(false);
  //   }
  // };

  // const handleVerifyAndCreate = async () => {
  //   if (!otp) {
  //     setOtpError("Please enter OTP");
  //     return;
  //   }

  //   setIsVerifyingOtp(true);
  //   try {
  //     // Verify OTP first
  //     await verifyOtp({
  //       otp,
  //       newEmployeeEmail: formData.email
  //     }).unwrap();

  //     // Create employee after OTP verification
  //     const finalPassword = formData.autoGeneratePassword
  //       ? Math.random().toString(36).slice(-8) + "@123"
  //       : formData.password;

  //     const body = {
  //       name: `${formData.firstName} ${formData.lastName}`,
  //       email: formData.email,
  //       phone: formData.phone,
  //       nationality: formData.nationality,
  //       password: finalPassword
  //     };

  //     await addNewAdminUser({
  //       roleId: formData.role,
  //       body
  //     }).unwrap();

  //     toast.success("Employee added successfully!");
  //     resetForm();
  //   } catch (error) {
  //     setOtpError("Invalid OTP. Please try again.");
  //     console.error("Verification error:", error);
  //   } finally {
  //     setIsVerifyingOtp(false);
  //   }
  // };

  // Update your OTP handling functions:

  const handleRequestOtp = async () => {
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.role
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setIsSendingOtp(true);
    try {
    // Pass employee email as parameter
    await requestOtp({ 
      employeeEmail: formData.email 
    }).unwrap();
      toast.info(`OTP sent to admin email`);
      setOtpStep("otp");
    } catch (error) {
      toast.error("Failed to send OTP");
      console.error("OTP send error:", error);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyAndCreate = async () => {
    if (!otp) {
      setOtpError("Please enter OTP");
      return;
    }
  
    setIsVerifyingOtp(true);
    try {
      // 1. Verify OTP and get token
      const verificationResponse = await verifyOtp({ 
        otp,
        email: formData.email 
      }).unwrap();
      console.log(verificationResponse);
  
      // 2. Create employee with the token
      const finalPassword = formData.autoGeneratePassword
        ? Math.random().toString(36).slice(-8) + "@123"
        : formData.password;
  
      const body = {
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone,
        nationality: formData.nationality,
        password: finalPassword
      };
  
      // 3. Pass the token in the request
      await addNewAdminUser({ 
        roleId: formData.role, 
        body,
        tempToken: verificationResponse.token // Add this
      }).unwrap();
  
      toast.success("Employee added successfully!");
      resetForm();
    } catch (error: any) {
      setOtpError(error?.data?.message || "Operation failed. Please try again.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      role: "",
      password: "",
      nationality: "",
      autoGeneratePassword: false,
    });
    setOtp("");
    setOtpError("");
    setOtpStep("form");
    onClose();
    refetchAllAdminUsers();
  };

  const handleResendOtp = async () => {
    try {
      await requestOtp({ newEmployeeEmail: formData.email }).unwrap();
      toast.info("OTP resent successfully");
      setOtpError("");
    } catch (error) {
      toast.error("Failed to resend OTP");
    }
  };

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={resetForm}
        PaperProps={{ sx: { width: { xs: 370, md: 400 }, padding: 3 } }}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {otpStep === "form" ? "Add New Employee" : "Verify Admin Identity"}
          </Typography>
          <IconButton onClick={resetForm}>
            <CloseIcon />
          </IconButton>
        </Box>

        {otpStep === "form" ? (
          <Box component="form" display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="First Name*"
                variant="outlined"
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
              />
              <TextField
                fullWidth
                label="Last Name*"
                variant="outlined"
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
              />
            </Box>

            <TextField
              fullWidth
              label="Nationality*"
              variant="outlined"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
            />

            <TextField
              fullWidth
              label="Email ID*"
              variant="outlined"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />

            <TextField
              fullWidth
              label="Phone Number*"
              variant="outlined"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.autoGeneratePassword}
                  onChange={(e) =>
                    handleChange("autoGeneratePassword", e.target.checked)
                  }
                />
              }
              label="Auto-generate password"
            />

            {!formData.autoGeneratePassword && (
              <TextField
                fullWidth
                label="Password*"
                type="password"
                variant="outlined"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
              />
            )}

            <Box>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
              >
                <InputLabel sx={{ color: "#000", fontWeight: 500 }}>
                  Role*
                </InputLabel>
                <Button
                  startIcon={<AddIcon />}
                  sx={{ color: "#FFC107", textTransform: "none" }}
                  onClick={() => setOpenPermissions(true)}
                >
                  Add Custom Role
                </Button>
              </Box>

              <FormControl fullWidth variant="outlined">
                <Select
                  value={formData.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                  displayEmpty
                >
                  {roles?.roles?.map((role: any) => (
                    <MenuItem key={role.roleName} value={role._id}>
                      {role.roleName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "red",
                  color: "red",
                  borderRadius: 8,
                  width: "48%",
                  textTransform: "none",
                }}
                onClick={resetForm}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleRequestOtp}
                disabled={isSendingOtp}
                sx={{
                  backgroundColor: "#FFC107",
                  color: "#000",
                  borderRadius: 8,
                  width: "48%",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#e6b800" },
                  boxShadow: "none",
                }}
              >
                {isSendingOtp ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Send OTP"
                )}
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <Typography variant="body1" gutterBottom>
              We've sent a 6-digit OTP to your admin email address.
            </Typography>

            <TextField
              fullWidth
              label="Enter OTP"
              variant="outlined"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setOtpError("");
              }}
              error={!!otpError}
              helperText={otpError}
              sx={{ my: 3 }}
            />

            <Button onClick={handleResendOtp} sx={{ textTransform: "none" }}>
              Didn't receive OTP? Resend
            </Button>

            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                variant="outlined"
                sx={{
                  borderColor: "red",
                  color: "red",
                  borderRadius: 8,
                  width: "48%",
                  textTransform: "none",
                }}
                onClick={() => setOtpStep("form")}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleVerifyAndCreate}
                disabled={isVerifyingOtp || isAddingAdmin}
                sx={{
                  backgroundColor: "#FFC107",
                  color: "#000",
                  borderRadius: 8,
                  width: "48%",
                  textTransform: "none",
                  "&:hover": { backgroundColor: "#e6b800" },
                  boxShadow: "none",
                }}
              >
                {isVerifyingOtp || isAddingAdmin ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Verify & Create"
                )}
              </Button>
            </Box>
          </Box>
        )}
      </Drawer>

      <ManagePermissionsDrawer
        open={openPermissions}
        onClose={() => setOpenPermissions(false)}
        isAdding={true}
        refetchAllRoles={refetchAllRoles}
        onRoleCreated={(newRoleId: string) => {
          setNewlyCreatedRoleId(newRoleId);
          setOpenPermissions(false);
        }}
      />
    </>
  );
};

export default AddEmployeeDrawer;
