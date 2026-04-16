import React, { useState } from 'react';
import {
  Box,
  Container,
  Tabs,
  Tab,
  useMediaQuery,
} from '@mui/material';
import DominicaInvestmentOptions from './DominicaInvestmentOptions';
import GrenadaInvestmentOptions from './GrenadaInvestmentOptions';

const BankDetailsPage: React.FC = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  // const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);

  // Fixed: Removed the unused event parameter
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const tabOptions = ['Dominica Investment Options', 'Grenada Investment Options'];

  return (
    <Container maxWidth="lg" sx={{ pt: 0, pb: 0 }}>
      {/* Tabs Section */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider',ml:{xs:"-45px" ,md:0} }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
              height: 3,
            },
          }}
        >
          {tabOptions.map((tab, index) => (
            <Tab 
              key={index} 
              label={tab} 
              sx={{ 
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: {xs:"15px", md:'16px'},
              }}
            />
          ))}
        </Tabs>
      </Box>

      {/* Content Section - Show based on active tab */}
      <Box sx={{ mt: 0,ml:{xs:"-45px" ,md:0} }}>
        {activeTab === 0 ? <DominicaInvestmentOptions /> : <GrenadaInvestmentOptions />}
      </Box>
    </Container>
  );
};

export default BankDetailsPage;