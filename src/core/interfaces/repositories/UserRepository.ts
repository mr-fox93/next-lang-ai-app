export interface User {
  id: string;
  username?: string;
  email?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: string;
  notifications?: boolean;
}

export interface UserRepository {
  getUserById(id: string): Promise<User | null>;
  getUserPreferences(userId: string): Promise<UserPreferences | null>;
} 