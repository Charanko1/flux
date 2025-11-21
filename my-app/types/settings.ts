export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    desktop: boolean;
    sound: boolean;
  };
  taskPreferences: {
    defaultPriority: 'low' | 'medium' | 'high';
    autoArchive: boolean;
    showCompleted: boolean;
    dueDateReminder: number; // hours before due date
  };
  privacy: {
    showOnlineStatus: boolean;
    allowDataCollection: boolean;
    profileVisibility: 'public' | 'private' | 'team';
  };
}

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}