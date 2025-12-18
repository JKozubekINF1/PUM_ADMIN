import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Link } from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    setError('');

    try {
      const res = await axiosClient.post('/auth/login', { email, password });
      
      const { token, mustChangePassword } = res.data;

      localStorage.setItem('token', token);

      if (mustChangePassword) {
          navigate('/change-password');
          return;
      }
      
      const decoded: any = jwtDecode(token);
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role;

      if (role !== 'Admin') {
        setError('Brak uprawnień administratora.');
        localStorage.removeItem('token');
        return;
      }

      navigate('/admin');
    } catch (err: any) {
       console.error(err);
       
       if (err.response) {
           if (err.response.status === 401) {
               setError('Nieprawidłowy email lub hasło.');
           } 
           else if (err.response.data && typeof err.response.data === 'string') {
               setError(err.response.data);
           } else {
               setError('Wystąpił błąd serwera. Spróbuj ponownie później.');
           }
       } else if (err.request) {
           setError('Brak połączenia z serwerem. Sprawdź, czy backend działa.');
       } else {
           setError('Wystąpił nieoczekiwany błąd aplikacji.');
       }
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f7fa">
      <Paper elevation={3} sx={{ p: 4, width: 380, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
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
        
        <TextField 
            fullWidth 
            label="Email" 
            margin="normal" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            error={!!error}
        />
        <TextField 
            fullWidth 
            label="Hasło" 
            type="password" 
            margin="normal" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            error={!!error}
        />

        <Box width="100%" display="flex" justifyContent="flex-end" sx={{ mt: 1 }}>
            <Link 
                component="button" 
                variant="body2" 
                onClick={() => navigate('/forgot-password')}
                sx={{ textDecoration: 'none', fontWeight: 500 }}
            >
                Nie pamiętasz hasła?
            </Link>
        </Box>
        
        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleLogin}>
            Zaloguj
        </Button>
      </Paper>
    </Box>
  );
}