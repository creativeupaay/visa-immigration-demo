import { useState } from 'react';
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
} from '@mui/material';
import { useUploadDeliveryDetailsMutation } from '../../../../features/customer/applicationMain/applicationMainApi';
import { toast } from 'react-toastify';

const VisaCompletionGrenada = ({stepStatusId}:{stepStatusId:string}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    alternatePhone: '',
    address: '',
    cityCountry: '',
    postalCode: '',
    confirmed: false,
  });

  const [uploadDeliveryDetails] = useUploadDeliveryDetailsMutation();


  const handleChange = (e:any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleConfirm = async () => {
    const {
      fullName,
      email,
      phone,
      alternatePhone,
      address,
      cityCountry,
      postalCode,
      confirmed,
    } = formData;
  
    if (
      !fullName ||
      !email ||
      !phone ||
      !address ||
      !cityCountry ||
      !postalCode ||
      !confirmed
    ) {
      toast.info('Please fill all required fields and confirm the checkbox.');
      return;
    }
  
    try {
      const body = {
        fullName,
        email,
        phoneNo: phone,
        alternativePhoneNo: alternatePhone,
        address,
        city: cityCountry.split(',')[0].trim(),
        country: cityCountry.split(',')[1]?.trim() || '',
        postalCode,
      };
  
      const response = await uploadDeliveryDetails({ stepStatusId, body }).unwrap();
      console.log('Response:', response);
      toast.success('Details submitted successfully!');
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Something went wrong while submitting your details.');
    }
  };
  

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3 }}>
        <Typography variant="h6" fontWeight="bold" mb={2}>
          Confirm Your Delivery Details
        </Typography>
        <Typography variant="body2" mb={3}>
          Your Dominica passport has been issued! Please review and confirm your delivery details below.
        </Typography>

        <Stack spacing={2}>
          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
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

          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
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

          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <TextField
              fullWidth
              label="Delivery Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
            <TextField
              fullWidth
              label="City & Country"
              name="cityCountry"
              value={formData.cityCountry}
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
            label="I confirm that the above details are correct and understand that changes after submission may not be possible."
          />

          <Box display="flex" gap={2} flexDirection={{ xs: 'column', sm: 'row' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleConfirm}
              sx={{ bgcolor: '#f7b500', color: '#000' }}
            >
              Confirm & Proceed
            </Button>
            <Button variant="outlined" fullWidth>
              Edit Details
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
};

export default VisaCompletionGrenada;
