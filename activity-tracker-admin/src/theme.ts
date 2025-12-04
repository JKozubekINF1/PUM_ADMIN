import { createTheme } from '@mui/material/styles';

// Kolor pobrany z Twojego logo (cyjan)
const activisBlue = '#00B4D8'; 

export const theme = createTheme({
  palette: {
    primary: {
      main: activisBlue, // Główny kolor przycisków i nagłówków
      contrastText: '#fff', // Biały tekst na niebieskim tle
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
          borderRadius: 8, // Zaokrąglone przyciski
          padding: '10px 20px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff', // Biały nagłówek w panelu
          color: '#333', // Ciemny tekst w nagłówku
          boxShadow: '0px 2px 4px -1px rgba(0,0,0,0.1)',
        }
      }
    }
  },
});