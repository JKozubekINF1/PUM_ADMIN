export interface UserDto {
  id: string;
  email: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  activitiesCount: number;
}

export interface ActivityDto {
  id: string;
  userId: string;
  userName: string; // To wyświetlimy w tabeli
  userAvatarUrl?: string;
  title: string;
  activityType: string;
  distanceMeters: number;
  durationSeconds: number;
  startedAt: string;
}

export interface StatsDto {
  totalUsers: number;
  totalActivities: number;
  totalDistanceKm: number;
  totalDurationHours: number;
}