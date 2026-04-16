import { Box, Typography, Stack, Avatar, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CircleIcon from '@mui/icons-material/Circle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Define the interface for AIMA document data
interface AIMADoc {
  _id: string;
  aimaStatus: string;
  isCompleted: boolean;
  completedOn: string | null;
  aimaNumber: string | null;
  stepStatusId: string;
  __v: number;
}

// Interface for component props
interface AIMAClientComponentProps {
  approved: boolean;
  aimaDocs: AIMADoc[];
  onContinue: () => void;
}

const AIMAClientComponent = ({ aimaDocs, approved, onContinue }: AIMAClientComponentProps) => {
  // Helper function to format date
  const formatDate = (date: string | null) => {
    if (!date) return "Not completed";
    const formattedDate = new Date(date).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    return formattedDate;
  };

  // Check if all steps are completed
  const allStepsCompleted = aimaDocs.every(doc => doc.isCompleted);

  return (
    <Box
    mt={{ xs: 0, md: 12 }}
      sx={{
        backgroundColor: '#f9f8f8',
        borderRadius: '20px',
        padding: '24px',
        width: '76vw',
        height:'60vh',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start', 
        overflowY: 'auto',
        // Mobile responsiveness
        '@media (max-width: 600px)': {
          width: '90vw', // Change width for mobile
          height: '70vh', // Adjust height for mobile
          padding: '16px', // Optional: Adjust padding for mobile
        }
      }}
    >
      
      <Stack spacing={4} sx={{ mt: 2, width: '100%' }}>
        {aimaDocs.map((doc) => (
          <Stack key={doc._id} direction="row" spacing={2} alignItems="center">
            <Avatar
              sx={{
                bgcolor: doc.isCompleted ? '#F6C328' : '#d3cdc9',
                width: 24,
                height: 24,
                boxShadow: doc.isCompleted 
                  ? '0 0 0 4px #fff, 0 0 0 6px #F6C32840'
                  : 'none',
              }}
            >
              {doc.isCompleted ? (
                <CheckIcon sx={{ color: 'black', fontSize: 16 }} />
              ) : (
                <CircleIcon sx={{ color: 'gray', fontSize: 16 }} />
              )}
            </Avatar>
            <Box>
              <Typography sx={{ fontWeight: 500, color: '#222' }}
              fontSize={{ xs: "1rem", sm: "1rem" }}
              >
                {doc.aimaStatus}
              </Typography>
              <Typography 
              fontSize={{ xs: "0.8rem", sm: "0.9  rem" }}
              sx={{ color: '#555' }}>
                {doc.isCompleted 
                  ? `Completed on - ${formatDate(doc.completedOn)}`
                  : "Pending"}
              </Typography>
              {doc.aimaNumber && (
                <Typography sx={{ fontSize: 14, color: '#555' }}>
                  AIMA Number: {doc.aimaNumber}
                </Typography>
              )}
            </Box>
          </Stack>
        ))}
      </Stack>

      {/* Continue button - only displays if all steps are completed */}
      {allStepsCompleted && approved && (
        <Box sx={{ display: 'flex', width: '100%'}}>
          <Button 
            endIcon={<ArrowForwardIcon />}
            onClick={onContinue}
            variant="outlined"
        sx={{
          borderColor:"black", 
          my: 5,
          color:"black",
          borderRadius:"15px",
          textTransform:"none",
          px:6,
          py:1
         }}
          >
            Continue
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default AIMAClientComponent;