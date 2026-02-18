import api from './api'

export interface Category {
  id: number
  name: string
  description?: string
  created_at: string
  updated_at: string
}

class CategoryService {
  async getAll() {
    return api.get<Category[]>('/categories')
  }

  async getById(id: number) {
    return api.get<Category>(`/categories/${id}`)
  }

  async create(category: Partial<Category>) {
    return api.post<Category>('/categories', category)
  }

  async update(id: number, category: Partial<Category>) {
    return api.put<Category>(`/categories/${id}`, category)
  }

  async delete(id: number) {
    return api.delete(`/categories/${id}`)
  }
}

export default new CategoryService()
