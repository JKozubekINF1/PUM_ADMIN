import { useState } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Link } from '@mui/material';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1); // 1 = Podaj email, 2 = Podaj token i hasło
  const [email, setEmail] = useState('');
  
  // Pola do resetu (Krok 2)
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // KROK 1: Wyślij prośbę o token
  const handleSendEmail = async () => {
    setMessage(null);
    setLoading(true);
    try {
      // Backend zwraca 200 OK nawet jak maila nie ma (security), więc zawsze przechodzimy dalej
      await axiosClient.post('/auth/forgot-password', { email });
      
      setMessage({ type: 'success', text: 'Jeśli konto istnieje, wysłaliśmy kod resetujący na Twój email.' });
      // Przełączamy na formularz wpisywania tokena
      setStep(2);
    } catch (err: any) {
        setMessage({ type: 'error', text: 'Wystąpił błąd połączenia z serwerem.' });
    } finally {
        setLoading(false);
    }
  };

  // KROK 2: Ustaw nowe hasło używając tokena
  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
        setMessage({ type: 'error', text: 'Hasła nie są identyczne.' });
        return;
    }

    setMessage(null);
    setLoading(true);

    try {
      await axiosClient.post('/auth/reset-password', {
        email,
        token,
        newPassword,
        confirmNewPassword
      });

      // Sukces
      alert("Hasło zostało zmienione pomyślnie! Możesz się zalogować.");
      navigate('/login');

    } catch (err: any) {
        // Obsługa błędów z backendu (np. zły token)
        if (err.response && err.response.data) {
             const data = err.response.data;
             if (Array.isArray(data)) {
                 setMessage({ type: 'error', text: data.map((e:any) => e.description).join('\n') });
             } else if (typeof data === 'string') {
                 setMessage({ type: 'error', text: data });
             } else {
                 setMessage({ type: 'error', text: 'Nieprawidłowy token lub błąd serwera.' });
             }
        } else {
            setMessage({ type: 'error', text: 'Wystąpił błąd.' });
        }
    } finally {
        setLoading(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="#f5f7fa">
      <Paper elevation={3} sx={{ p: 4, width: 400, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        {/* LOGO */}
        <Box component="img" src="/logo.jpg" alt="Activis" sx={{ height: 50, mb: 2, borderRadius: 1 }} />

        <Typography variant="h5" mb={1} fontWeight="bold" color="textSecondary">
            Resetowanie Hasła
        </Typography>

        <Typography variant="body2" color="textSecondary" mb={3} textAlign="center">
            {step === 1 
                ? "Podaj swój adres email, aby otrzymać kod resetujący." 
                : "Sprawdź skrzynkę pocztową i wpisz otrzymany kod oraz nowe hasło."}
        </Typography>

        {message && (
            <Alert severity={message.type} sx={{ mb: 2, width: '100%' }}>
                {message.text}
            </Alert>
        )}

        {/* FORMULARZ KROK 1 */}
        {step === 1 && (
            <>
                <TextField 
                    fullWidth label="Email" type="email" margin="normal" 
                    value={email} onChange={e => setEmail(e.target.value)} 
                />
                <Button 
                    fullWidth variant="contained" size="large" sx={{ mt: 2 }} 
                    onClick={handleSendEmail}
                    disabled={loading || !email}
                >
                    {loading ? "Wysyłanie..." : "Wyślij kod"}
                </Button>
            </>
        )}

        {/* FORMULARZ KROK 2 */}
        {step === 2 && (
            <>
                {/* Email wyświetlamy jako disabled, żeby user wiedział dla kogo zmienia */}
                <TextField fullWidth label="Email" value={email} disabled margin="dense" />
                
                <TextField 
                    fullWidth label="Kod z e-maila (Token)" margin="normal" 
                    value={token} onChange={e => setToken(e.target.value)} 
                    autoFocus
                />
                <TextField 
                    fullWidth label="Nowe hasło" type="password" margin="normal" 
                    value={newPassword} onChange={e => setNewPassword(e.target.value)} 
                />
                <TextField 
                    fullWidth label="Potwierdź hasło" type="password" margin="normal" 
                    value={confirmNewPassword} onChange={e => setConfirmNewPassword(e.target.value)} 
                />

                <Button 
                    fullWidth variant="contained" size="large" sx={{ mt: 2 }} 
                    onClick={handleResetPassword}
                    disabled={loading}
                >
                    {loading ? "Zmienianie..." : "Zmień hasło"}
                </Button>
                
                <Button sx={{ mt: 1 }} onClick={() => setStep(1)}>
                    Wyślij kod ponownie
                </Button>
            </>
        )}

        <Box mt={3}>
            <Link component="button" variant="body2" onClick={() => navigate('/login')}>
                Wróć do logowania
            </Link>
        </Box>

      </Paper>
    </Box>
  );
}