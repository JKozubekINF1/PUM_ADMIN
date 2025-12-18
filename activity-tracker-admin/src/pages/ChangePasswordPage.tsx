import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert } from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function ChangePasswordPage() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    try {
      await axiosClient.post('/auth/change-initial-password', { 
        newPassword, 
        confirmNewPassword: confirmPassword 
      });
      
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Wystąpił błąd podczas zmiany hasła.');
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f7fa">
      <Paper elevation={3} sx={{ p: 4, width: 400, textAlign: 'center' }}>
        <Box component="img" src="/logo.jpg" sx={{ height: 50, mb: 2 }} />
        
        <Typography variant="h5" fontWeight="bold" gutterBottom>
           Wymagana zmiana hasła
        </Typography>
        <Typography variant="body2" color="textSecondary" mb={3}>
           To Twoje pierwsze logowanie. Ze względów bezpieczeństwa musisz ustawić nowe hasło.
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <TextField 
            fullWidth label="Nowe hasło" type="password" margin="normal" 
            value={newPassword} onChange={e => setNewPassword(e.target.value)} 
        />
        <TextField 
            fullWidth label="Powtórz nowe hasło" type="password" margin="normal" 
            value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} 
        />

        <Button fullWidth variant="contained" size="large" sx={{ mt: 3 }} onClick={handleSubmit}>
            Zmień hasło i wejdź
        </Button>
      </Paper>
    </Box>
  );
}