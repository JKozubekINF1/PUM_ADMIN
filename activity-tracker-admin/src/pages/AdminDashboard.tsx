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
  
  // Stany dla Modali szczegółów
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

  // --- LOGIKA USUWANIA ---

  const handleDeleteUser = async (userId: string, event: React.MouseEvent) => {
      event.stopPropagation(); 
      if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika? Operacja jest nieodwracalna.")) {
          return;
      }
      try {
          await axiosClient.delete(`/admin/users/${userId}`);
          setUsers(prev => prev.filter(u => u.id !== userId));
      } catch (error) {
          alert("Nie udało się usunąć użytkownika.");
      }
  };

  const handleDeleteActivity = async (activityId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!window.confirm("Czy na pewno chcesz usunąć tę aktywność?")) {
          return;
      }
      try {
          await axiosClient.delete(`/admin/activities/${activityId}`);
          setActivities(prev => prev.filter(a => a.id !== activityId));
      } catch (error) {
          alert("Nie udało się usunąć aktywności.");
      }
  };

  // --- FORMATOWANIE DANYCH ---

  const formatDuration = (seconds: number) => {
      const h = Math.floor(seconds / 3600);
      const m = Math.floor((seconds % 3600) / 60);
      const s = seconds % 60;
      if (h > 0) return `${h}h ${m}m ${s}s`;
      return `${m}m ${s}s`;
  };

  const formatSpeed = (ms?: number) => {
      if (!ms) return '-';
      return `${(ms * 3.6).toFixed(1)} km/h`;
  };

  // --- DEFINICJE KOLUMN ---

  const userColumns: GridColDef[] = [
    { 
      field: 'avatarUrl', headerName: 'Avatar', width: 80, 
      align: 'center', headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
            <Avatar src={params.value as string} /> 
          </Box>
      )
    },
    { field: 'userName', headerName: 'Nazwa użytkownika', minWidth: 180, flex: 1.2 },
    { field: 'email', headerName: 'Email', minWidth: 200, flex: 1.5 }, 
    { field: 'firstName', headerName: 'Imię', minWidth: 100, flex: 1 },
    { field: 'lastName', headerName: 'Nazwisko', minWidth: 100, flex: 1 },
    { field: 'activitiesCount', headerName: 'Aktywności', width: 120, type: 'number', align: 'center', headerAlign: 'center' },
    {
        field: 'actions', headerName: 'Akcje', width: 80,
        sortable: false,
        align: 'center',
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

  const activityColumns: GridColDef[] = [
    { 
        field: 'userAvatarUrl', headerName: 'Avatar', width: 80,
        align: 'center', headerAlign: 'center',
        renderCell: (params: GridRenderCellParams) => (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', width: '100%' }}>
                <Avatar src={params.value as string} sx={{ width: 35, height: 35 }} />
            </Box>
        )
    },
    { field: 'userName', headerName: 'Nazwa użytkownika', minWidth: 150, flex: 1 },
    { field: 'activityType', headerName: 'Typ', width: 120, align: 'center', headerAlign: 'center',
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value as string} color="primary" variant="outlined" size="small" /> 
    },
    { field: 'title', headerName: 'Tytuł', minWidth: 150, flex: 1.2 },
    { field: 'distanceMeters', headerName: 'Dystans', width: 120, 
      valueFormatter: (value: any) => value ? `${(value / 1000).toFixed(2)} km` : '-' 
    },
    { field: 'durationSeconds', headerName: 'Czas', width: 120, 
      valueFormatter: (value: any) => formatDuration(value)
    },
    { field: 'startedAt', headerName: 'Data', minWidth: 160, flex: 1,
      valueFormatter: (value: any) => value ? new Date(value).toLocaleDateString() : ''
    },
    {
        field: 'actions', headerName: 'Akcje', width: 80,
        sortable: false,
        align: 'center',
        renderCell: (params) => (
            <IconButton 
                color="error" 
                onClick={(e) => handleDeleteActivity(params.row.id, e)}
            >
                <DeleteIcon />
            </IconButton>
        )
    }
  ];

  return (
    // Layout na całą wysokość ekranu (bez scrolla body)
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa', overflow: 'hidden' }}>
      
      <AppBar position="static" color="inherit" elevation={1}>
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: '50px !important' }}>
            <Box display="flex" alignItems="center" gap={2}>
                <Box component="img" src="/logo.jpg" sx={{ height: 35, borderRadius: 1 }} alt="Activis" />
                <Typography variant="h6" color="primary" fontWeight="bold">Activis Admin</Typography>
            </Box>
            <Button startIcon={<LogoutIcon />} onClick={handleLogout} color="inherit">Wyloguj</Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2, maxWidth: 1400, margin: '0 auto', width: '100%', flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Statystyki */}
        <Box display="flex" gap={2} mb={2} flexWrap="wrap" flexShrink={0}>
            <PaperStat title="Użytkownicy" value={stats?.totalUsers} />
            <PaperStat title="Aktywności" value={stats?.totalActivities} />
            <PaperStat title="Łączny Dystans (km)" value={stats?.totalDistanceKm} />
        </Box>

        {/* Zakładki */}
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 1, borderBottom: 1, borderColor: 'divider', minHeight: 40 }}>
            <Tab label="Wszystkie Aktywności" sx={{ minHeight: 40, py: 0 }} />
            <Tab label="Użytkownicy" sx={{ minHeight: 40, py: 0 }} />
        </Tabs>

        {/* Kontener tabeli */}
        <Paper sx={{ 
            flex: 1, 
            width: '100%', 
            p: 1, 
            borderRadius: 2, 
            display: 'flex', 
            flexDirection: 'column',
            minHeight: 0, 
            overflow: 'hidden'
        }}>
            {tabIndex === 0 && (
                <DataGrid 
                    rows={activities} 
                    columns={activityColumns} 
                    pageSizeOptions={[10, 20]}
                    rowHeight={50}
                    onRowClick={(params) => setSelectedActivity(params.row as ActivityDto)}
                    sx={{ border: 'none', flex: 1 }} 
                />
            )}

            {tabIndex === 1 && (
                <DataGrid 
                    rows={users} 
                    columns={userColumns} 
                    pageSizeOptions={[10]} 
                    rowHeight={60}
                    onRowClick={(params) => setSelectedUser(params.row as UserDto)}
                    sx={{ border: 'none', flex: 1 }}
                />
            )}

            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, textAlign: 'center', flexShrink: 0 }}>
                * Kliknij wiersz, aby zobaczyć szczegóły.
            </Typography>
        </Paper>

      </Box>

      {/* --- MODAL 1: SZCZEGÓŁY AKTYWNOŚCI --- */}
      <Dialog open={!!selectedActivity} onClose={() => setSelectedActivity(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedActivity?.userAvatarUrl} />
            <Box>
                <Typography variant="h6">{selectedActivity?.title || "Bez tytułu"}</Typography>
                <Typography variant="caption" color="textSecondary">
                    {selectedActivity?.userName} • {new Date(selectedActivity?.startedAt || '').toLocaleString()}
                </Typography>
            </Box>
        </DialogTitle>
        <DialogContent dividers>
            {selectedActivity && (
                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Chip label={selectedActivity.activityType} color="primary" sx={{ mb: 1 }} />
                        {selectedActivity.description && (
                            <Typography variant="body2" color="textSecondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                                "{selectedActivity.description}"
                            </Typography>
                        )}
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 1 }}>STATYSTYKI GŁÓWNE</Divider>
                    </Grid>

                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">DYSTANS</Typography>
                        <Typography variant="h6">{(selectedActivity.distanceMeters / 1000).toFixed(2)} km</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">CZAS TRWANIA</Typography>
                        <Typography variant="h6">{formatDuration(selectedActivity.durationSeconds)}</Typography>
                    </Grid>

                    <Grid size={12}>
                        <Divider sx={{ my: 1 }}>PRĘDKOŚĆ</Divider>
                    </Grid>

                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">ŚREDNIA</Typography>
                        <Typography variant="body1">{formatSpeed(selectedActivity.averageSpeedMs)}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">MAKSYMALNA</Typography>
                        <Typography variant="body1">{formatSpeed(selectedActivity.maxSpeedMs || 0)}</Typography>
                    </Grid>
                    
                    <Grid size={12}>
                        <Divider sx={{ my: 1 }}>CZAS</Divider>
                    </Grid>
                    
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">START</Typography>
                        <Typography variant="body2">{new Date(selectedActivity.startedAt).toLocaleString()}</Typography>
                    </Grid>
                    <Grid size={6}>
                        <Typography variant="subtitle2" color="textSecondary">KONIEC</Typography>
                        <Typography variant="body2">{selectedActivity.endedAt ? new Date(selectedActivity.endedAt).toLocaleString() : '-'}</Typography>
                    </Grid>
                </Grid>
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