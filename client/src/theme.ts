import { createTheme, Theme } from '@mui/material/styles';


const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#F7C228',
    },
    secondary: {
      main: "#691B99",
    },
    text: {
      primary: '#201f1e',
      secondary: "#6A6464",
    },
    success: {
      main: '#64AF64',
    },
    error:{
      main:"#F44336",
    },
    warning:{
      main:"#FFC95C"
    },
  },
  typography: {
    fontFamily: "'Montserrat', sans-serif",
  },
});

export default theme;
