export interface AuthUserResponse {
  id: number;
  username: string;
  role: 'admin' | 'staff' | 'resident';
  fullName: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

