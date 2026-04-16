import React, { useState } from 'react';
import { TextField, Typography, Box, Button } from '@mui/material';
import { useUploadShippingDetailsMutation } from '../../../features/admin/visaApplicationInformation/visaApplicationInformationApi';
import { useFetchDeliveryDetailsQuery } from '../../../features/common/commonApi';
import { toast } from 'react-toastify';

// type ClientDetails = {
//   name: string;
//   email: string;
//   phone: string;
//   address: string;
//   cityCountry: string;
//   postalCode: string;
// };

type PassportDeliveryDetailsProps = {
  stepStatusId: string;
  refetch: () => void;
};

const PassportDeliveryDetails: React.FC<PassportDeliveryDetailsProps> = ({
  stepStatusId,
  refetch
}) => {
  const [courierService, setCourierService] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [supportPhone, setSupportPhone] = useState('');

  const { data:deliveryData } = useFetchDeliveryDetailsQuery({
      stepStatusId,
    });
  const [uploadShippingDetails, { isLoading }] = useUploadShippingDetailsMutation();

  const handleSubmit = async () => {
    if (
      !courierService ||
      !trackingNumber ||
      !trackingUrl ||
      !supportEmail ||
      !supportPhone
    ) {
      toast.info('Please fill all the fields!');
      return;
    }

    const data = {
      courierService,
      trackingNo: trackingNumber,
      trackingUrl,
      email: supportEmail,  
      phoneNo: supportPhone
    };
    console.log(data)

    try {
      await uploadShippingDetails({ stepStatusId, data }).unwrap();
      setCourierService('');
      setTrackingNumber('');
      setTrackingUrl('');
      setSupportEmail('');
      setSupportPhone('');
      toast.success('Shipping details submitted successfully.');
      refetch();
    } catch (error) {
      console.error('Error uploading shipping details:', error);
      toast.error('Failed to submit shipping details.');
    }
  };

  return (
    <Box p={2}>
      <Typography gutterBottom sx={{ fontSize: '16px' }}>
        Client Delivery Details
      </Typography>

      <Box display="flex" flexWrap="wrap" justifyContent="space-between" mb={3} sx={{ fontSize: '14px' }}>
        <Box width={{ xs: '100%', md: '48%' }} mb={1}>
          <Typography><strong>Name:</strong> {deliveryData?.data?.delivery?.fullName}</Typography>
          <Typography><strong>Delivery Address:</strong> {deliveryData?.data?.delivery?.address}</Typography>
          <Typography><strong>City/Country:</strong> {deliveryData?.data?.delivery?.city},{deliveryData?.data?.delivery?.country}</Typography>
        </Box>

        <Box width={{ xs: '100%', md: '48%' }} mb={1}>
          <Typography><strong>Email address:</strong> {deliveryData?.data?.delivery?.email}</Typography>
          <Typography><strong>Phone Number:</strong> {deliveryData?.data?.delivery?.phoneNo}</Typography>
          <Typography><strong>Postal Code:</strong> {deliveryData?.data?.delivery?.postalCode}</Typography>
        </Box>
      </Box>

      <Typography gutterBottom sx={{ fontSize: '16px' }}>
        Add Passport Delivery Details
      </Typography>

      <Typography gutterBottom sx={{ fontSize: '14px' }}>
        Shipping Provider & Tracking Info
      </Typography>

      <Box display="flex" gap={2} my={2}>
        <TextField
          label="Courier Service*"
          placeholder="Enter Courier Service"
          value={courierService}
          onChange={(e) => setCourierService(e.target.value)}
          fullWidth
        />
        <TextField
          label="Tracking Number*"
          placeholder="Enter Tracking Number"
          value={trackingNumber}
          onChange={(e) => setTrackingNumber(e.target.value)}
          fullWidth
        />
        <TextField
          label="Tracking URL*"
          placeholder="Enter Tracking URL"
          value={trackingUrl}
          onChange={(e) => setTrackingUrl(e.target.value)}
          fullWidth
        />
      </Box>

      <Typography sx={{ fontSize: '14px' }} gutterBottom>
        Additional Support
      </Typography>

      <Box display="flex" gap={2} my={2}>
        <TextField
          label="Email*"
          placeholder="Enter Support Email"
          value={supportEmail}
          onChange={(e) => setSupportEmail(e.target.value)}
          fullWidth
        />
        <TextField
          label="Phone Number*"
          placeholder="Enter Support Phone Number"
          value={supportPhone}
          onChange={(e) => setSupportPhone(e.target.value)}
          fullWidth
        />
      </Box>

      <Button
        variant="outlined"
        onClick={handleSubmit}
        disabled={isLoading}
        sx={{
          borderColor: isLoading ? 'grey.400' : 'black',
          color: isLoading ? 'grey.600' : 'black',
          textTransform: 'none',
          borderRadius: '20px'
        }}
      >
        {isLoading ? 'Submitting...' : 'Submit'}
      </Button>
    </Box>
  );
};

export default PassportDeliveryDetails;
