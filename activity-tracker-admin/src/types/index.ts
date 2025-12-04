export interface UserDto {
  id: string;
  email: string;
  userName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  activitiesCount: number;
  phoneNumber?: string;
  dateOfBirth?: string; 
  gender?: string;
  height?: number;
  weight?: number;
}

export interface ActivityDto {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl?: string;
  title?: string;
  activityType: string;
  distanceMeters: number;
  durationSeconds: number;
  startedAt: string;
  endedAt?: string;
  averageSpeedMs?: number;
  maxSpeedMs?: number;
  description?: string;
  createdAt?: string;
}

export interface StatsDto {
  totalUsers: number;
  totalActivities: number;
  totalDistanceKm: number;
  totalDurationHours: number;
}