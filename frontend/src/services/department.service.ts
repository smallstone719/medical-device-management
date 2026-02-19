import api from './api'

export interface Department {
  id: number
  code?: string
  name: string
  description?: string
  is_active?: boolean
  parent_id?: number
  parent_name?: string
  manager_id?: number
  manager_name?: string
  manager_avatar?: string
  member_count?: number
  created_at: string
  updated_at: string
}

class DepartmentService {
  async getAll(filters?: any) {
    return api.get<Department[]>('/departments', filters)
  }

  async getById(id: number) {
    return api.get<Department>(`/departments/${id}`)
  }

  async create(department: Partial<Department>) {
    return api.post<Department>('/departments', department)
  }

  async update(id: number, department: Partial<Department>) {
    return api.put<Department>(`/departments/${id}`, department)
  }

  async delete(id: number) {
    return api.delete(`/departments/${id}`)
  }
}

export default new DepartmentService()
