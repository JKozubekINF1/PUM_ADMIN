import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { theme } from './theme.ts' // Import motywu

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Reset stylów CSS */}
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)