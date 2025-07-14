export interface User {
  id: string;
  username?: string;
  email?: string;
  dailyGoal?: number;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
}

export interface UserRepository {
  getUserById(id: string): Promise<User | null>;
  updateDailyGoal(userId: string, dailyGoal: number): Promise<void>;
} 