import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      const { token } = res.data;

      const decoded: any = jwtDecode(token);
      // Pamiętaj: upewnij się, że claim roli pasuje do tego co zwraca Twój backend
      // Czasem jest to "role", czasem ten długi URL schemas.microsoft...
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;

      if (role !== 'Admin') {
        setError('Brak uprawnień administratora.');
        return;
      }

      localStorage.setItem('token', token);
      navigate('/admin');
    } catch (err) {
        console.error(err);
      setError('Błędne dane logowania lub błąd serwera.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f7fa">
      <Paper elevation={3} sx={{ p: 4, width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* LOGO */}
        <Box 
            component="img" 
            src="/logo.jpg" 
            alt="Activis Logo" 
            sx={{ height: 60, mb: 2, borderRadius: 1 }} 
        />

        <Typography variant="h5" mb={3} fontWeight="bold" color="textSecondary">
            Panel Administratora
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2, width: '100%' }}>{error}</Alert>}
        
        <TextField fullWidth label="Email" margin="normal" value={email} onChange={e => setEmail(e.target.value)} />
        <TextField fullWidth label="Hasło" type="password" margin="normal" value={password} onChange={e => setPassword(e.target.value)} />
        
        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleLogin}>
            Zaloguj
        </Button>
      </Paper>
    </Box>
  );
}