import api from './api'

export interface Statistics {
  total_devices: number
  active_devices: number
  maintenance_devices: number
  broken_devices: number
  retired_devices: number
  total_inspections: number
  pending_inspections: number
  total_tickets: number
  open_tickets: number
  devices_by_category: Array<{ category_name: string; count: number }>
  devices_by_department: Array<{ department_name: string; count: number }>
  recent_inspections: Array<any>
  recent_tickets: Array<any>
}

class StatisticsService {
  async getOverview(departmentId?: number) {
    return api.get<Statistics>('/statistics', departmentId ? { department_id: departmentId } : undefined)
  }
}

export default new StatisticsService()
