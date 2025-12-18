import { createTheme } from '@mui/material/styles';

const activisBlue = '#00B4D8'; 

export const theme = createTheme({
  palette: {
    primary: {
      main: activisBlue,
      contrastText: '#fff',
    },
    secondary: {
      main: '#edf2f4',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    button: {
      fontWeight: 'bold',
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '10px 20px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: '#333',
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
        }
      }
    }
  },
});