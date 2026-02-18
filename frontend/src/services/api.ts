// API Service - Kết nối với backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

interface RequestOptions extends RequestInit {
  params?: Record<string, any>
}

class ApiService {
  private getAuthToken(): string | null {
    return localStorage.getItem('token')
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    
    let url = `${API_BASE_URL}${endpoint}`
    
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).filter(([_, v]) => v != null)
      ).toString()
      if (queryString) url += `?${queryString}`
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Merge with any existing headers
    if (fetchOptions.headers) {
      Object.assign(headers, fetchOptions.headers)
    }

    const token = this.getAuthToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }

  async upload(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value))
      })
    }

    const token = this.getAuthToken()
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }
}

export default new ApiService()
