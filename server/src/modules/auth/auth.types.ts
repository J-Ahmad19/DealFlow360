export interface UserContext {
  id: string;
  email: string;
  role: 'admin' | 'sales_manager' | 'finance' | 'sales_rep';
  status: 'active' | 'inactive' | 'suspended';
}

export interface JwtPayload {
  userId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
