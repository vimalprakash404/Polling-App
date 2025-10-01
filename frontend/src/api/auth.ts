import axios from './axios';

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axios.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axios.post('/auth/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post('/auth/logout');
  },
};
