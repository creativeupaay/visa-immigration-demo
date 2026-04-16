import { useState } from "react";
import {
  Box,
  TextField,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Container,
  Paper,
  Stack,
} from "@mui/material";
import { useUploadDeliveryDetailsMutation } from "../../../../features/customer/applicationMain/applicationMainApi";
import { toast } from "react-toastify";

const DGDeliveryForm = ({stepStatusId, refetch}:{stepStatusId:string, refetch:()=>void}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    confirmed: false,
  });

  const [uploadDeliveryDetails] = useUploadDeliveryDetailsMutation();

  const handleChange = (e:any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleConfirm = async () => {
    const {
      fullName,
      email,
      phone,
      alternatePhone,
      address,
      city,
      country,
      postalCode,
      confirmed,
    } = formData;

    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !city ||
      !country ||
      !postalCode ||
      !confirmed
    ) {
      toast.info("Please fill all required fields and confirm the checkbox.");
      return;
    }

    try {
      const body = {
        fullName,
        email,
        phoneNo: phone,
        alternativePhoneNo: alternatePhone,
        address,
        city,
        country,
        postalCode,
      };

      console.log(body)

      const response = await uploadDeliveryDetails({
        stepStatusId,
        body,
      }).unwrap();
      refetch();

      console.log("Response:", response);
      toast.success("Details submitted successfully!");
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong while submitting your details.");
    }
  };
  
  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2} textAlign={"center"}>
          Confirm Your Delivery Details
        </Typography>
        <Typography variant="body2" mb={3} textAlign={"center"}>
          Your passport has been issued! Please review and confirm your delivery
          details below.
        </Typography>

        <Stack spacing={2}>
          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <TextField
              fullWidth
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Box>

          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <TextField
              fullWidth
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Alternate Phone Number"
              name="alternatePhone"
              value={formData.alternatePhone}
              onChange={handleChange}
            />
          </Box>

          <TextField
            fullWidth
            label="Delivery Address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
          />

          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <TextField
              fullWidth
              label="City"
              name="city"
              value={formData.city}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              required
            />
          </Box>

          <TextField
            fullWidth
            label="Postal Code"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            required
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.confirmed}
                onChange={handleChange}
                name="confirmed"
              />
            }
            label={
              <Typography
                sx={{
                  fontSize: {
                    xs: "0.75rem",
                    md: "1rem",
                  },
                }}
              >
                I confirm that the above details are correct and understand that
                changes after submission may not be possible.
              </Typography>
            }
          />

          <Box
            display="flex"
            gap={2}
            flexDirection={{ xs: "column", sm: "row" }}
          >
            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirm}
              sx={{
                bgcolor: "#F6C328",
                color: "#000",
                boxShadow: "none",
                borderRadius: "20px",
                textTransform: "none",
              }}
            >
              Confirm & Proceed
            </Button>
            <Button
              variant="outlined"
              fullWidth
              sx={{
                borderColor: "black",
                color: "black",
                textTransform: "none",
                borderRadius: "20px",
              }}
            >
              Edit Details
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default DGDeliveryForm;