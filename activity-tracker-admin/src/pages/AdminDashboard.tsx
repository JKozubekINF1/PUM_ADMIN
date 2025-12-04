import { useEffect, useState } from 'react';
import { Box, Tab, Tabs, Typography, Avatar, Chip, Dialog, DialogTitle, DialogContent, AppBar, Toolbar, Button } from '@mui/material';
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import LogoutIcon from '@mui/icons-material/Logout';
import axiosClient from '../api/axiosClient';
import { type UserDto, type ActivityDto, type StatsDto } from '../types';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [stats, setStats] = useState<StatsDto | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);
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
  }

  // Kolumny Użytkowników
  const userColumns: GridColDef[] = [
    { 
      field: 'avatarUrl', headerName: 'Avatar', width: 70,
      renderCell: (params: GridRenderCellParams) => <Avatar src={params.value as string} /> 
    },
    { field: 'userName', headerName: 'Nick', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'firstName', headerName: 'Imię', width: 130 },
    { field: 'lastName', headerName: 'Nazwisko', width: 130 },
    { field: 'activitiesCount', headerName: 'Aktywności', width: 100, type: 'number' },
  ];

  // Kolumny Aktywności
  const activityColumns: GridColDef[] = [
    { 
        field: 'userAvatarUrl', headerName: 'User', width: 70,
        renderCell: (params: GridRenderCellParams) => <Avatar src={params.value as string} />
    },
    { field: 'userName', headerName: 'Kto', width: 150 },
    { field: 'activityType', headerName: 'Typ', width: 120, 
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value as string} color="primary" variant="outlined" /> 
    },
    { field: 'distanceMeters', headerName: 'Dystans (m)', width: 130, type: 'number' },
    { field: 'durationSeconds', headerName: 'Czas (s)', width: 130, type: 'number' },
    { field: 'startedAt', headerName: 'Data', width: 180, 
      valueFormatter: (value: any) => value ? new Date(value).toLocaleString() : ''
    },
  ];

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#f5f7fa' }}>
      
      {/* Pasek Górny z Logo */}
      <AppBar position="static" color="inherit">
        <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Logo po lewej */}
            <Box display="flex" alignItems="center" gap={2}>
                <Box component="img" src="/logo.jpg" sx={{ height: 40 }} alt="Activis" />
                <Typography variant="h6" color="primary" fontWeight="bold">
                    Panel Administracyjny
                </Typography>
            </Box>

            {/* Przycisk Wyloguj */}
            <Button startIcon={<LogoutIcon />} onClick={handleLogout} color="inherit">
                Wyloguj
            </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 4, maxWidth: 1200, margin: '0 auto', width: '100%' }}>
        {/* Statystyki */}
        <Box display="flex" gap={2} mb={4}>
            <PaperStat title="Użytkownicy" value={stats?.totalUsers} />
            <PaperStat title="Aktywności" value={stats?.totalActivities} />
            <PaperStat title="Łączny Dystans (km)" value={stats?.totalDistanceKm} />
        </Box>

        {/* Zakładki */}
        <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Wszystkie Aktywności" />
            <Tab label="Użytkownicy" />
        </Tabs>

        {/* Tabela Aktywności */}
        {tabIndex === 0 && (
            <Box sx={{ height: 600, width: '100%', bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
            <DataGrid 
                rows={activities} 
                columns={activityColumns} 
                pageSizeOptions={[10, 20]}
                onRowClick={(params) => setSelectedActivity(params.row as ActivityDto)}
                sx={{ cursor: 'pointer', border: 'none' }}
            />
            </Box>
        )}

        {/* Tabela Użytkowników */}
        {tabIndex === 1 && (
            <Box sx={{ height: 600, width: '100%', bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 1 }}>
            <DataGrid rows={users} columns={userColumns} pageSizeOptions={[10]} sx={{ border: 'none' }} />
            </Box>
        )}
      </Box>

      {/* Modal Szczegółów */}
      <Dialog open={!!selectedActivity} onClose={() => setSelectedActivity(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Szczegóły Aktywności</DialogTitle>
        <DialogContent dividers>
            {selectedActivity && (
                <Box>
                    <Typography variant="h6" color="primary">{selectedActivity.title || "Bez tytułu"}</Typography>
                    <Typography><strong>Użytkownik:</strong> {selectedActivity.userName}</Typography>
                    <Typography><strong>Typ:</strong> {selectedActivity.activityType}</Typography>
                    <Typography><strong>Data:</strong> {new Date(selectedActivity.startedAt).toLocaleString()}</Typography>
                    <hr style={{ margin: '15px 0', border: '0', borderTop: '1px solid #eee' }} />
                    <Typography variant="body1"><strong>Dystans:</strong> {selectedActivity.distanceMeters} m</Typography>
                    <Typography variant="body1"><strong>Czas:</strong> {selectedActivity.durationSeconds} s</Typography>
                </Box>
            )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

function PaperStat({ title, value }: { title: string, value?: number }) {
    return (
        <Box sx={{ p: 3, bgcolor: 'white', borderRadius: 3, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', minWidth: 200 }}>
            <Typography variant="body2" color="textSecondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold" color="primary" mt={1}>
                {value ?? '-'}
            </Typography>
        </Box>
    )
}