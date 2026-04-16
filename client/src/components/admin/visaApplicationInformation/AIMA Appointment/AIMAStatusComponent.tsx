import { useState, useEffect } from 'react';
import { TextField, Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CircleIcon from '@mui/icons-material/Circle';
import DoneIcon from '@mui/icons-material/Done';
import { useUpdateAimaStatusMutation } from '../../../../features/admin/visaApplication/additional/portugalApis';

const AIMAStatusComponent = ({ stepData }: { stepData: any }) => {
  const [aimaNumber, setAimaNumber] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [localAimaDocs, setLocalAimaDocs] = useState<any[]>([]);
  
  // RTK Query mutation hook
  const [updateAimaStatus, { isLoading: isUpdatingApi }] = useUpdateAimaStatusMutation();

  // Initialize local state with props when component mounts or stepData changes
  useEffect(() => {
    if (stepData?.aimaDocs) {
      setLocalAimaDocs([...stepData.aimaDocs]);
    }
  }, [stepData?.aimaDocs]);

  const handleUpdateStatus = async (docId: string, status: string) => {
    try {
      setIsUpdating(true);
      
      // Only send aimaNumber if the status is "AIMA Appointment Scheduled"
      const requestData = status === 'AIMA Appointment Scheduled' 
        ? { aimaId: docId, aimaNumber } 
        : { aimaId: docId };
      
      // Call the RTK Query mutation
      const response = await updateAimaStatus(requestData).unwrap();
      
      // Update local state to mark the step as completed
      setLocalAimaDocs(prev => 
        prev.map(doc => 
          doc._id === docId 
            ? { ...doc, isCompleted: true, ...(status === 'AIMA Appointment Scheduled' ? { aimaNumber } : {}) } 
            : doc
        )
      );
      
      // Reset the AIMA number after successful update
      if (status === 'AIMA Appointment Scheduled') {
        setAimaNumber('');
      }
      
      console.log('Status updated successfully', response);
    } catch (error) {
      console.error('Failed to update status:', error);
      // Handle error notification
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {localAimaDocs.map((doc: any) => (
        <Box 
          key={doc._id}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2, 
            py: 1,
            borderBottom: '1px solid #e0e0e0',
          }}
        >
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
          
          <Typography sx={{ flex: 1 }}>
            {doc.aimaStatus}
            {doc.aimaNumber && <Typography component="span" sx={{ ml: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
              (AIMA: {doc.aimaNumber})
            </Typography>}
          </Typography>
          
          {doc.aimaStatus === 'AIMA Appointment Scheduled' && !doc.isCompleted && (
            <TextField
              label="AIMA Number*"
              variant="outlined"
              size="small"
              value={aimaNumber}
              onChange={(e) => setAimaNumber(e.target.value)}
              sx={{ width: 180, mr: 1 }}
            />
          )}
          
          {!doc.isCompleted && (
            <Tooltip title="Mark as completed">
              <span>
                <IconButton
                  color="primary"
                  onClick={() => handleUpdateStatus(doc._id, doc.aimaStatus)}
                  disabled={isUpdating || isUpdatingApi || 
                    (doc.aimaStatus === 'AIMA Appointment Scheduled' && !aimaNumber)}
                  sx={{
                    backgroundColor: '#f0f0f0',
                    color: '#333',
                    '&:hover': {
                      backgroundColor: '#e0e0e0',
                    },
                    width: 36,
                    height: 36,
                  }}
                >
                  <DoneIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default AIMAStatusComponent;