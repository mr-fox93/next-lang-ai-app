export interface UserData {
  id: string;
  email: string;
  preferredLanguage?: string;
}

export interface UserRepository {
  upsertUser(userData: UserData): Promise<any>;
  getUserById(id: string): Promise<any>;
} 