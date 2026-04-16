import React from 'react';
import { TextField, Typography, Box } from '@mui/material';

interface TextInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  placeholder = 'Enter text',
  value,
  onChange,
  required = false,
  disabled = false,
  error = false,
  helperText = '',
}) => {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography 
        sx={{ 
          fontSize: '14px', 
          fontWeight: 500, 
          mb: 0.5,
          color: 'text.secondary' 
        }}
      >
        {label}
        {required && <span style={{ color: 'red' }}>*</span>}
      </Typography>
      <TextField
        fullWidth
        variant="outlined"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        error={error}
        helperText={helperText}
        size="medium"
        sx={{
          backgroundColor: "#F6F5F5",
          '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
          },
        }}
      />
    </Box>
  );
};

export default TextInput;