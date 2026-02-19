import api from './api'

export interface User {
  id: number
  username: string
  full_name: string
  email?: string
  phone_number?: string
  role: 'admin' | 'inspector' | 'technician' | 'viewer'
  department_id?: number
  department_name?: string
  is_active?: boolean
  avatar?: string
  zalo_id?: string
  created_at: string
  updated_at: string
}

class UserService {
  async getAll(filters?: any) {
    return api.get<User[]>('/users', filters)
  }

  async getById(id: number) {
    return api.get<User>(`/users/${id}`)
  }

  async create(user: Partial<User> & { password: string }) {
    return api.post<User>('/users', user)
  }

  async update(id: number, user: Partial<User>) {
    return api.put<User>(`/users/${id}`, user)
  }

  async delete(id: number) {
    return api.delete(`/users/${id}`)
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    return api.put(`/users/${id}/password`, { oldPassword, newPassword })
  }
}

export default new UserService()
