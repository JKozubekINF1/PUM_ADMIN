import { useEffect, useState } from 'react';
import { 
  Box, Tab, Tabs, Typography, Avatar, Chip, Dialog, DialogTitle, DialogContent, 
  AppBar, Toolbar, Button, IconButton, Grid, Divider, Paper 
} from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';
import axiosClient from '../api/axiosClient';
import { type UserDto, type ActivityDto, type StatsDto } from '../types';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [stats, setStats] = useState<StatsDto | null>(null);
  
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const usersRes = await axiosClient.get('/admin/users');
        setUsers(usersRes.data);
        const actRes = await axiosClient.get('/admin/activities');
        setActivities(actRes.data);
        const statsRes = await axiosClient.get('/admin/stats');
        setStats(statsRes.data);
    } catch (error) {
        console.error("Błąd pobierania danych", error);
    }
  };

  const handleLogout = () => {
      localStorage.removeItem('token');
      navigate('/login');
  };

  const handleDeleteUser = async (userId: string, event: React.MouseEvent) => {
      event.stopPropagation(); 
      if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
          return;
      }
      try {
          await axiosClient.delete(`/admin/users/${userId}`);
          setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
          alert("Nie udało się usunąć użytkownika.");
      }
  };

  // --- KOLUMNY UŻYTKOWNIKÓW ---
  const userColumns: GridColDef[] = [
    { 
      field: 'avatarUrl', headerName: 'Avatar', width: 80, 
      align: 'center', headerAlign: 'center',
      // POPRAWKA: Box centrujący avatar idealnie w pionie i poziomie
      renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <Avatar src={params.value as string} /> 
          </Box>
      )
    },
    { field: 'userName', headerName: 'Nazwa użytkownika', width: 200 },
    { field: 'email', headerName: 'Email', minWidth: 200, flex: 1.5 }, 
    { field: 'firstName', headerName: 'Imię', minWidth: 100, flex: 1 },
    { field: 'lastName', headerName: 'Nazwisko', minWidth: 100, flex: 1 },
    { field: 'activitiesCount', headerName: 'Aktywności', width: 120, type: 'number', align: 'center', headerAlign: 'center' },
    {
        field: 'actions', headerName: 'Akcje', width: 80,
        sortable: false,
        renderCell: (params) => (
            <IconButton 
                color="error" 
                onClick={(e) => handleDeleteUser(params.row.id, e)}
            >
                <DeleteIcon />
            </IconButton>
        )
    }
  ];

  // --- KOLUMNY AKTYWNOŚCI ---
  const activityColumns: GridColDef[] = [
    { 
        field: 'userAvatarUrl', headerName: 'User', width: 80,
        align: 'center', headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <Avatar src={params.value as string} />
            </Box>
        )
    },
    { field: 'userName', headerName: 'Kto', minWidth: 150, flex: 1 },
    { field: 'activityType', headerName: 'Typ', width: 120, 
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value as string} color="primary" variant="outlined" /> 
    },
    { field: 'distanceMeters', headerName: 'Dystans (m)', width: 130, type: 'number' },
    { field: 'startedAt', headerName: 'Data', minWidth: 180, flex: 1,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleString() : ''
    },
  ];

  return (
    // ZMIANA: height: 100vh i overflow: hidden (blokuje scrollowanie całej strony)
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa', overflow: 'hidden' }}>
      
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '50px !important' }}> {/* Zmniejszony toolbar */}
            <Box display="flex" alignItems="center" gap={2}>
                <Box component="img" src="/logo.jpg" sx={{ height: 35, borderRadius: 1 }} alt="Activis" />
                <Typography variant="h6" color="primary" fontWeight="bold">Activis Admin</Typography>
            </Box>
            <Button startIcon={<LogoutIcon />} onClick={handleLogout} color="inherit">Wyloguj</Button>
        </Toolbar>
      </AppBar>

      {/* ZMIANA: Zmniejszone paddingi (p: 2) i flex: 1 dla kontenera */}
      <Box sx={{ p: 2, maxWidth: 1400, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* ZMIANA: Zmniejszony margines (mb: 2) */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap" flexShrink={0}>
            <PaperStat title="Użytkownicy" value={stats?.totalUsers} />
            <PaperStat title="Aktywności" value={stats?.totalActivities} />
            <PaperStat title="Łączny Dystans (km)" value={stats?.totalDistanceKm} />
        </Box>

        {/* ZMIANA: Zmniejszony margines pod tabami */}
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 1, borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
            <Tab label="Wszystkie Aktywności" sx={{ minHeight: 40, py: 0 }} />
            <Tab label="Użytkownicy" sx={{ minHeight: 40, py: 0 }} />
        </Tabs>

        {/* --- KONTENER TABELI --- */}
        {/* ZMIANA: flex: 1 i minHeight: 0 sprawiają, że tabela zajmuje POZOSTAŁE miejsce i ani piksela więcej */}
        <Paper sx={{ 
            flex: 1, 
            width: '100%', 
            p: 1, 
            borderRadius: 2, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0, // Kluczowe dla flexboxa
            overflow: 'hidden'
        }}>
            {tabIndex === 0 && (
                <DataGrid 
                    rows={activities} 
                    columns={activityColumns} 
                    pageSizeOptions={[10, 20]}
                    rowHeight={50} // Trochę mniejszy wiersz dla kompaktowości (możesz dać 60 jeśli wolisz)
                    onRowClick={(params) => setSelectedActivity(params.row as ActivityDto)}
                    sx={{ border: 'none', flex: 1 }} 
                />
            )}

            {tabIndex === 1 && (
                <DataGrid 
                    rows={users} 
                    columns={userColumns} 
                    pageSizeOptions={[10]} 
                    rowHeight={60} // Wiersz dla userów wyższy dla avatara
                    onRowClick={(params) => setSelectedUser(params.row as UserDto)}
                    sx={{ border: 'none', flex: 1 }}
                />
            )}

            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, textAlign: 'center', flexShrink: 0 }}>
                * Kliknij wiersz, aby zobaczyć profil.
            </Typography>
        </Paper>

      </Box>

      {/* --- MODAL 1: SZCZEGÓŁY AKTYWNOŚCI --- */}
      <Dialog open={!!selectedActivity} onClose={() => setSelectedActivity(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Szczegóły Aktywności</DialogTitle>
        <DialogContent dividers>
            {selectedActivity && (
                <Box>
                    <Typography variant="h6" color="primary">{selectedActivity.title || "Bez tytułu"}</Typography>
                    <Typography><strong>Użytkownik:</strong> {selectedActivity.userName}</Typography>
                    <Typography><strong>Typ:</strong> {selectedActivity.activityType}</Typography>
                    <Typography><strong>Data:</strong> {new Date(selectedActivity.startedAt).toLocaleString()}</Typography>
                    <Divider sx={{ my: 2 }} />
                    <Typography><strong>Dystans:</strong> {selectedActivity.distanceMeters} m</Typography>
                    <Typography><strong>Czas:</strong> {selectedActivity.durationSeconds} s</Typography>
                </Box>
            )}
        </DialogContent>
      </Dialog>

      {/* --- MODAL 2: PEŁNY PROFIL UŻYTKOWNIKA --- */}
      <Dialog open={!!selectedUser} onClose={() => setSelectedUser(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedUser?.avatarUrl} sx={{ width: 50, height: 50 }} />
            <Box>
                <Typography variant="h6">{selectedUser?.userName}</Typography>
                <Typography variant="caption" color="textSecondary">ID: {selectedUser?.id}</Typography>
            </Box>
        </DialogTitle>
        <DialogContent dividers>
            {selectedUser && (
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Typography variant="subtitle2" color="textSecondary">EMAIL</Typography>
                        <Typography variant="body1">{selectedUser.email}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">IMIĘ I NAZWISKO</Typography>
                        <Typography variant="body1">
                            {selectedUser.firstName} {selectedUser.lastName || '-'}
                        </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">DATA URODZENIA</Typography>
                        <Typography variant="body1">
                            {selectedUser.dateOfBirth ? new Date(selectedUser.dateOfBirth).toLocaleDateString() : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">PŁEĆ</Typography>
                        <Typography variant="body1">{selectedUser.gender || '-'}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">TELEFON</Typography>
                        <Typography variant="body1">{selectedUser.phoneNumber || '-'}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">WZROST</Typography>
                        <Typography variant="body1">{selectedUser.height ? `${selectedUser.height} cm` : '-'}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">WAGA</Typography>
                        <Typography variant="body1">{selectedUser.weight ? `${selectedUser.weight} kg` : '-'}</Typography>
                    </Grid>
                    <Grid size={12}>
                         <Divider sx={{ my: 1 }} />
                         <Typography variant="subtitle2" color="textSecondary">STATYSTYKI</Typography>
                         <Typography variant="body1">Liczba aktywności: <strong>{selectedUser.activitiesCount}</strong></Typography>
                    </Grid>
                </Grid>
            )}
        </DialogContent>
      </Dialog>

    </Box>
  );
}

function PaperStat({ title, value }: { title: string, value?: number }) {
    return (
        // Zmniejszone paddingi w statystykach (p: 2)
        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minWidth: 150, flex: 1 }}>
            <Typography variant="caption" color="textSecondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold" color="primary" mt={0.5}>
                {value ?? '-'}
            </Typography>
        </Box>
    )
}