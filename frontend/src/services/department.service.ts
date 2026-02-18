import api from './api'

export interface Department {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

class DepartmentService {
  async getAll() {
    return api.get<Department[]>('/departments')
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
