export interface ProfileUpdateDto {
  firstName: string;
  lastName: string;
  email: string;
}

export interface PasswordChangeDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  taskReminders: boolean;
  weeklyDigest: boolean;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  defaultProjectId?: string;
}

export interface SecuritySettings {
  twoFactorEnabled: boolean;
  lastPasswordChange: Date;
  activeSessions: number;
}