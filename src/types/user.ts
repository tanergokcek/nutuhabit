export interface User {
  id: string;
  email: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  photoURL: string | null;
  isPremium: boolean;
  createdAt: string; // ISO date string
  settings: UserSettings;
}

export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  reminderTime: string | null; // 'HH:MM'
  weekStartsOn: 0 | 1; // 0=Sunday, 1=Monday
  language: 'tr' | 'en';
}
