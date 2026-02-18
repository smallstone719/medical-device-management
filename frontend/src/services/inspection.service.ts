import api from './api'

export interface Inspection {
  id: number
  device_id: number
  inspector_id: number
  inspection_date: string
  status: 'good' | 'warning' | 'critical'
  notes?: string
  next_inspection_date?: string
  created_at: string
  updated_at: string
}

export interface InspectionFilters {
  device_id?: number
  inspector_id?: number
  status?: string
  from_date?: string
  to_date?: string
  page?: number
  limit?: number
}

class InspectionService {
  async getAll(filters?: InspectionFilters) {
    return api.get<{ data: Inspection[]; total: number }>('/inspections', filters)
  }

  async getById(id: number) {
    return api.get<Inspection>(`/inspections/${id}`)
  }

  async create(inspection: Partial<Inspection>) {
    return api.post<Inspection>('/inspections', inspection)
  }

  async update(id: number, inspection: Partial<Inspection>) {
    return api.put<Inspection>(`/inspections/${id}`, inspection)
  }

  async delete(id: number) {
    return api.delete(`/inspections/${id}`)
  }
}

export default new InspectionService()
