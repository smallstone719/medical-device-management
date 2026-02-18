import api from './api'

export interface LoginCredentials {
  username: string
  password: string
}

export interface User {
  id: number
  username: string
  full_name: string
  email: string
  role: string
  department_id?: number
}

export interface AuthResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
  }
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ token: string; user: User }> {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    if (response.data && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
      return response.data
    }
    throw new Error('Invalid response from server')
  }

  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('token')
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await api.post('/auth/change-password', { old_password: oldPassword, new_password: newPassword })
  }
}

export default new AuthService()
