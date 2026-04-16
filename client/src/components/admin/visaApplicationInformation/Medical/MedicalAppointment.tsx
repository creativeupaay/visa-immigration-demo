import React, { useEffect, useState } from 'react';
import {
  TextField,
  Typography,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Chip,
} from '@mui/material';
import { Check } from '@mui/icons-material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { 
  useFetchMedicalTestInfoQuery,
  useSubmitMedicalDetailsMutation,
  useApproveReschedulingReqMutation,
  useMarkTestAsCompletedMutation
} from '../../../../features/admin/visaApplication/additional/dubaiApis';
import { toast } from 'react-toastify';

interface MedicalAppointmentProps {
  stepStatusId: string;
}
const MedicalAppointment: React.FC<MedicalAppointmentProps> = ({ stepStatusId }) => {

  const { data, refetch } = useFetchMedicalTestInfoQuery({ stepStatusId });
  const [submitMedicalDetails, { isLoading: isSubmitting }] = useSubmitMedicalDetailsMutation();
  const [approveRescheduling, { isLoading: isApproving }] = useApproveReschedulingReqMutation();
  const [markTestAsCompleted, { isLoading: isMarkingCompleted }] = useMarkTestAsCompletedMutation();

  const [status, setStatus] = useState('Pending');
  const [date, setDate] = useState<Dayjs | null>(dayjs());
  const [time, setTime] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!data?.data) {
      setStatus('Pending');
    } else {
      const medicalData = data?.data?.medicalInfo;
      if (medicalData) {
        if (medicalData.status === "Completed") {
          setStatus("Completed");
        } else if (medicalData.status === "RescheduleReq_Sent") {
          setStatus("RescheduleReq_Sent");
        } else {
          setStatus("Scheduled");
        }
      }
      if (medicalData?.date) setDate(dayjs(medicalData.date));
      if (medicalData?.time) setTime(medicalData.time);
      if (medicalData?.hospitalName) setHospitalName(medicalData.hospitalName);
      if (medicalData?.address) setAddress(medicalData.address);
      if (medicalData?.contactNumber) setContactNumber(medicalData.contactNumber);
    }
  }, [data]);

  const handleSubmit = async () => {
    if (!status || !date || !time || !hospitalName || !address || !contactNumber) {
      toast.info('Please fill all the fields!');
      return;
    }

    const medicalInfo = {
      date: date.format('YYYY-MM-DD'),
      time,
      hospitalName,
      address,
      contactNumber
    };

    try {
      await submitMedicalDetails({
        stepStatusId,
        medicalInfo
      }).unwrap();
      
      // Refetch data after successful submission
      refetch();
      toast.success('Medical details submitted successfully!');
    } catch (error) {
      console.error('Failed to submit medical details:', error);
      toast.error('Failed to submit medical details. Please try again.');
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      await markTestAsCompleted({
        stepStatusId
      }).unwrap();
      
      // Refetch data after marking as completed
      refetch();
      toast.success('Medical test marked as completed successfully!');
    } catch (error) {
      console.error('Failed to mark test as completed:', error);
      toast.error('Failed to mark test as completed. Please try again.');
    }
  };

  const handleApproveReschedule = async () => {
    try {
      const medicalInfo = {
        date: date?.format('YYYY-MM-DD'),
        time,
        hospitalName,
        address,
        contactNumber
      };
      
      await approveRescheduling({
        stepStatusId,
        medicalInfo
      }).unwrap();
      
      // Refetch data after rescheduling
      refetch();
      toast.success('Appointment rescheduled successfully!');
      handleCloseModal();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      toast.error('Failed to reschedule appointment. Please try again.');
    }
  };

  const handleOpenModal = () => {
    // Ensure modal opens with current values
    if (data?.data?.medicalInfo) {
      const medicalData = data?.data?.medicalInfo;
      if (medicalData.date) setDate(dayjs(medicalData.date));
      if (medicalData.time) setTime(medicalData.time);
      if (medicalData.hospitalName) setHospitalName(medicalData.hospitalName);
      if (medicalData.address) setAddress(medicalData.address);
      if (medicalData.contactNumber) setContactNumber(medicalData.contactNumber);
    }
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box mt={{md:2}} p={{md:2}}>
        {data?.data?.medicalInfo?.status==="RescheduleReq_Sent" &&<Box display="flex" alignItems="center" gap={1} color="red" mb={3}>
          <Typography sx={{ fontWeight: 'bold' }}>❗</Typography>
          <Typography
            sx={{ cursor: 'pointer', }}
            onClick={handleOpenModal}
          >
            Client requested for a Reschedule of Medical test.<span className=' underline'>Click here to View.</span>
          </Typography>
        </Box>}

        <Box display={'flex'} alignItems={'center'} gap={3} mb={2}>
          <Box display={"flex"} alignItems={"center"}>
            <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
              Status:
            </Typography>
            {status === 'Pending' && (
              <Chip label="Pending" color="warning" />
            )}
            {status === 'Scheduled' && (
              <Box display="flex" alignItems="center">
                <Chip label="Scheduled" color="primary" sx={{ mr: 2 }} />
                <Button
                  variant="outlined"
                  startIcon={<Check />}
                  onClick={handleMarkAsCompleted}
                  disabled={isMarkingCompleted}
                  sx={{borderRadius: '20px', textTransform: 'none'}}
                >
                  Mark as Completed
                </Button>
                {isMarkingCompleted && (
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                    Processing...
                  </Typography>
                )}
              </Box>
            )}
            {status === 'Completed' && (
              <Chip label="Completed" color="primary" />
            )}
            {status === 'RescheduleReq_Sent' && (
              <Chip label="Reschedule Requested" color="error" />
            )}
          </Box>
        </Box>

        <Typography sx={{ fontSize: '16px', my: 3 }} gutterBottom>
          Add Medical Test Appointment Details
        </Typography>

        <Box display="flex" gap={2} mb={2}>
          <DatePicker
            label="Date*"
            value={date}
            onChange={(newDate) => setDate(newDate)}
            slotProps={{
              textField: {
                fullWidth: true,
              },
            }}
          />
          <TextField
            label="Time*"
            placeholder="Enter Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            fullWidth
          />
        </Box>

        <Box display="flex" gap={2} mb={2}>
          <TextField
            label="Hospital Name*"
            placeholder="Enter Hospital name"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Address*"
            placeholder="Enter Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
          />
        </Box>

        <TextField
          label="Contact Number*"
          placeholder="Enter Contact details"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          sx={{ mb: 3, minWidth: {md:'500px'} }}
        />
      </Box>

      {status !== "Completed" && <Button
        variant="outlined"
        sx={{
          borderColor: 'black',
          color: 'black',
          textTransform: 'none',
          borderRadius: '20px',
        }}
        onClick={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </Button>}

      {/* Modal for Reschedule Request */}
      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogTitle>Reschedule Request</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            The client has requested a reschedule of their medical test. Please
            review the details and take appropriate action.
          </Typography>
        <Typography mb={4}> <b>Reason:</b> <span className='text-gray-500'>{data?.data?.medicalInfo.rescheduleReason	}</span></Typography>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newValue) => setDate(newValue)}
              slotProps={{
                textField: {
                  fullWidth: true,
                  sx: { mb: 2 },
                  required: true
                },
              }}
            />
          </LocalizationProvider>

          <TextField
            label="Time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Hospital Name"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />

          <TextField
            label="Contact Number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            fullWidth
            sx={{ mb: 2 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleApproveReschedule} 
            variant="contained" 
            color="warning"
            disabled={isApproving}
          >
            {isApproving ? 'Processing...' : 'Approve Reschedule'}
          </Button>
          <Button onClick={handleCloseModal} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
};

export default MedicalAppointment;