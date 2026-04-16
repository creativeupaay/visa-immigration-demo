import { useState } from "react";
import { useForgotPasswordMutation } from "../authApi";
import {
  Box,
  Button,
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import Logo from "../../../assets/logomark.png";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      await forgotPassword(email).unwrap();
      toast.success("Password reset link sent.")
    } catch (err) {
      toast.error("An error occurred");
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
        minHeight: "100vh",
        padding: 3,
      }}
    >
      {/* Logo/Image */}
      <Box
        component="img"
        src={Logo}
        alt="Logo"
        sx={{
          marginBottom: 2,
          objectFit: "cover",
        }}
      />

      <Typography variant="h4" gutterBottom sx={{ color: "white" }}>
        Forgot Password
      </Typography>

      <form onSubmit={handleSubmit} style={{ width: "100%", maxWidth: 400 }}>
        <TextField
          label="Enter your email"
          variant="outlined"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ input: { color: 'white' }, label: { color: 'white' }, "& .MuiOutlinedInput-root": { "& fieldset": { borderColor: "white" } }}}
        />
        <Button
        variant="contained"
          type="submit"
          fullWidth
          sx={{ bgColor:"#F7C228", marginTop: 2 ,textTransform:"none"}}
          disabled={isLoading}
        >
          {isLoading ? (
            <CircularProgress size={24} sx={{ color: "white" }} />
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </form>

      {/* {message && (
        <Typography
          variant="body2"
          color={message.includes("error") ? "error" : "success"}
          sx={{ marginTop: 2, color: 'white',textTransform:"none" }} 
        >
          {message}
        </Typography>
      )} */}
    </Box>
  );
};

export default ForgotPassword;
