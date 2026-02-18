import api from './api'

export interface Device {
  id: number
  name: string
  code: string
  category_id: number
  department_id: number
  status: 'active' | 'maintenance' | 'broken' | 'retired'
  purchase_date?: string
  warranty_expiry?: string
  specifications?: string
  notes?: string
  qr_code?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export interface DeviceFilters {
  search?: string
  category_id?: number
  department_id?: number
  status?: string
  page?: number
  limit?: number
}

class DeviceService {
  async getAll(filters?: DeviceFilters) {
    return api.get<{ data: Device[]; total: number; page: number; limit: number }>('/devices', filters)
  }

  async getById(id: number) {
    return api.get<Device>(`/devices/${id}`)
  }

  async create(device: Partial<Device>) {
    return api.post<Device>('/devices', device)
  }

  async update(id: number, device: Partial<Device>) {
    return api.put<Device>(`/devices/${id}`, device)
  }

  async delete(id: number) {
    return api.delete(`/devices/${id}`)
  }

  async uploadImage(id: number, file: File) {
    return api.upload(`/devices/${id}/image`, file)
  }
}

export default new DeviceService()
