import { useEffect, useState } from 'react';
// Usunięto 'Grid' z importów
import { Box, Tab, Tabs, Typography, Avatar, Chip, Dialog, DialogTitle, DialogContent } from '@mui/material';
// Dodano 'type' do importów z MUI
import { DataGrid, type GridColDef, type GridRenderCellParams } from '@mui/x-data-grid';
import axiosClient from '../api/axiosClient';
// Dodano 'type' do importów własnych
import { type UserDto, type ActivityDto, type StatsDto } from '../types';

export default function AdminDashboard() {
  const [tabIndex, setTabIndex] = useState(0);
  const [users, setUsers] = useState<UserDto[]>([]);
  const [activities, setActivities] = useState<ActivityDto[]>([]);
  const [stats, setStats] = useState<StatsDto | null>(null);

  // Stan dla modala szczegółów
  const [selectedActivity, setSelectedActivity] = useState<ActivityDto | null>(null);

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
        console.error("Błąd pobierania danych:", error);
    }
  };

  // Kolumny dla Użytkowników
  const userColumns: GridColDef[] = [
    { 
      field: 'avatarUrl', headerName: 'Avatar', width: 70,
      // params.value jest tutaj bezpieczne w renderCell
      renderCell: (params: GridRenderCellParams) => <Avatar src={params.value as string} /> 
    },
    { field: 'userName', headerName: 'Nick', width: 150 },
    { field: 'email', headerName: 'Email', width: 200 },
    { field: 'firstName', headerName: 'Imię', width: 130 },
    { field: 'activitiesCount', headerName: 'Liczba Aktywności', width: 150, type: 'number' },
  ];

  // Kolumny dla Aktywności
  const activityColumns: GridColDef[] = [
    { 
        field: 'userAvatarUrl', headerName: 'User', width: 70,
        renderCell: (params: GridRenderCellParams) => <Avatar src={params.value as string} />
    },
    { field: 'userName', headerName: 'Kto', width: 130 },
    { field: 'activityType', headerName: 'Typ', width: 120, 
      renderCell: (params: GridRenderCellParams) => <Chip label={params.value as string} color="primary" variant="outlined" /> 
    },
    { field: 'distanceMeters', headerName: 'Dystans (m)', width: 130, type: 'number' },
    { field: 'durationSeconds', headerName: 'Czas (s)', width: 130, type: 'number' },
    { field: 'startedAt', headerName: 'Data', width: 180, 
      // POPRAWKA: valueFormatter teraz przyjmuje wartość bezpośrednio (value), a nie params
      valueFormatter: (value: any) => value ? new Date(value).toLocaleString() : ''
    },
  ];

  return (
    <Box sx={{ p: 4, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Statystyki na górze */}
      <Box display="flex" gap={2} mb={4}>
        <PaperStat title="Użytkownicy" value={stats?.totalUsers} />
        <PaperStat title="Aktywności" value={stats?.totalActivities} />
        <PaperStat title="Łączny Dystans (km)" value={stats?.totalDistanceKm} />
      </Box>

      {/* Zakładki */}
      <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
        <Tab label="Aktywności" />
        <Tab label="Użytkownicy" />
      </Tabs>

      {/* Tabela Aktywności */}
      {tabIndex === 0 && (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid 
            rows={activities} 
            columns={activityColumns} 
            pageSizeOptions={[10, 20]}
            onRowClick={(params) => setSelectedActivity(params.row as ActivityDto)}
            sx={{ cursor: 'pointer' }}
          />
          <Typography variant="caption" color="textSecondary">
            * Kliknij w wiersz, aby zobaczyć szczegóły
          </Typography>
        </Box>
      )}

      {/* Tabela Użytkowników */}
      {tabIndex === 1 && (
        <Box sx={{ height: 600, width: '100%' }}>
          <DataGrid rows={users} columns={userColumns} pageSizeOptions={[10]} />
        </Box>
      )}

      {/* Modal ze szczegółami */}
      <Dialog open={!!selectedActivity} onClose={() => setSelectedActivity(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Szczegóły Aktywności</DialogTitle>
        <DialogContent dividers>
            {selectedActivity && (
                <Box>
                    <Typography variant="h6">{selectedActivity.title || "Bez tytułu"}</Typography>
                    <Typography><strong>Użytkownik:</strong> {selectedActivity.userName}</Typography>
                    <Typography><strong>Typ:</strong> {selectedActivity.activityType}</Typography>
                    <Typography><strong>Data:</strong> {new Date(selectedActivity.startedAt).toLocaleString()}</Typography>
                    <hr />
                    <Typography><strong>Dystans:</strong> {selectedActivity.distanceMeters} m</Typography>
                    <Typography><strong>Czas trwania:</strong> {selectedActivity.durationSeconds} s</Typography>
                </Box>
            )}
        </DialogContent>
      </Dialog>

    </Box>
  );
}

// Mały komponent do kafelków statystyk
function PaperStat({ title, value }: { title: string, value?: number }) {
    return (
        <Box sx={{ p: 2, bgcolor: 'white', borderRadius: 2, boxShadow: 1, minWidth: 150 }}>
            <Typography variant="subtitle2" color="textSecondary">{title}</Typography>
            <Typography variant="h4">{value ?? '-'}</Typography>
        </Box>
    )
}