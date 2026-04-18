import { useMemo, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";

type VisaType = "PORTUGAL" | "DUBAI" | "DOMINICA" | "GRENADA";
type Priority = "HIGH" | "MEDIUM" | "LOW";

const DemoLeadFormPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    visaType: "PORTUGAL" as VisaType,
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    priority: "MEDIUM" as Priority,
    extraInfo: "",
  });

  const backendBaseUrl = useMemo(() => {
    return import.meta.env.VITE_BACKEND_BASE_URL;
  }, []);

  const onChange =
    (key: keyof typeof formData) =>
    (event: React.ChangeEvent<HTMLInputElement> | any) => {
      setFormData((prev) => ({ ...prev, [key]: event.target.value }));
    };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!backendBaseUrl) {
      toast.error("VITE_BACKEND_BASE_URL is missing.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        `${backendBaseUrl}/api/v1/public/leads/create-demo`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to create demo lead");
      }

      toast.success(
        `Lead created: ${result?.data?.nanoLeadId || "ID generated"}`
      );

      setFormData((prev) => ({
        ...prev,
        fullName: "",
        email: "",
        phone: "",
        nationality: "",
        extraInfo: "",
      }));
    } catch (error: any) {
      toast.error(error?.message || "Unable to create lead");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 20% 20%, #f9efc2 0%, #f8f2dc 35%, #efe7cb 100%)",
        px: 2,
        py: 5,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          maxWidth: 760,
          margin: "0 auto",
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          border: "1px solid #d3c79f",
        }}
      >
        <Stack spacing={1.5} mb={3}>
          <Typography variant="h4" fontWeight={700} color="#292826">
            Demo Lead Creation
          </Typography>
          <Typography variant="body1" color="#625f59">
            Use this public page to create demo leads directly from this website,
            without external webhook dependency.
          </Typography>
        </Stack>

        <Box component="form" onSubmit={onSubmit}>
          <Stack spacing={2.2}>
            <FormControl fullWidth>
              <InputLabel id="visa-type-label">Visa Type</InputLabel>
              <Select
                labelId="visa-type-label"
                value={formData.visaType}
                label="Visa Type"
                onChange={onChange("visaType")}
              >
                <MenuItem value="PORTUGAL">Portugal</MenuItem>
                <MenuItem value="DUBAI">Dubai</MenuItem>
                <MenuItem value="DOMINICA">Dominica</MenuItem>
                <MenuItem value="GRENADA">Grenada</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Full Name"
              value={formData.fullName}
              onChange={onChange("fullName")}
              required
              fullWidth
            />

            <TextField
              type="email"
              label="Email"
              value={formData.email}
              onChange={onChange("email")}
              required
              fullWidth
            />

            <TextField
              label="Phone"
              value={formData.phone}
              onChange={onChange("phone")}
              required
              fullWidth
            />

            <TextField
              label="Nationality"
              value={formData.nationality}
              onChange={onChange("nationality")}
              required
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="priority-label">Priority</InputLabel>
              <Select
                labelId="priority-label"
                value={formData.priority}
                label="Priority"
                onChange={onChange("priority")}
              >
                <MenuItem value="HIGH">High</MenuItem>
                <MenuItem value="MEDIUM">Medium</MenuItem>
                <MenuItem value="LOW">Low</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Extra Info (Optional)"
              value={formData.extraInfo}
              onChange={onChange("extraInfo")}
              multiline
              minRows={3}
              fullWidth
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="contained"
              sx={{
                mt: 1,
                textTransform: "none",
                borderRadius: 999,
                py: 1.2,
                fontWeight: 700,
                bgcolor: "#f7c228",
                color: "#1f1f1d",
                "&:hover": { bgcolor: "#e5b421" },
              }}
            >
              {isSubmitting ? "Creating Lead..." : "Create Demo Lead"}
            </Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default DemoLeadFormPage;
