import  { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../authApi';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import Logo from "../../../assets/logomark.png" 
import { toast } from 'react-toastify';
const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  // const [message, setMessage] = useState('');
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      toast.error('Invalid or missing token.');
    }
  }, [token]);

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    if (!token) {
      toast.error('Token is required.');
      return;
    }

    try {
      const response = await resetPassword({ token, newPassword }).unwrap();
      toast.success(response?.message);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      toast.error( 'An error occurred');
    }
  };

  return (
    <Box
    bgcolor="#292927" 
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{
        minHeight: '100vh',
        padding: 3,
      }}
    >

      <Box
              component="img"
              src={Logo}
              alt="Logo"
              sx={{
                marginBottom: 5,
                objectFit: "cover",
              }}
            />
      <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
        Reset Password
      </Typography>

      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 400 }}>
        <TextField
          label="Enter new password"
          type="password"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          sx={{ input: { color: 'white' }, label: { color: 'white' }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "white" } }}}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ marginTop: 2 ,textTransform:"none"}}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: 'white' }} />
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>

      {/* {message && (
        <Typography
          variant="body2"
          color={message.toLowerCase().includes('error') ? 'error' : 'success.main'}
          sx={{ marginTop: 2 }}
        >
          {message}
        </Typography>
      )} */}
    </Box>
  );
};

export default ResetPassword;
