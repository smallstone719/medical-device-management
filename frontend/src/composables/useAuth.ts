import { ref, computed } from 'vue'
import authService, { type User } from '@/services/auth.service'

const user = ref<User | null>(authService.getCurrentUser())
const isAuthenticated = computed(() => !!user.value)

export function useAuth() {
  const login = async (username: string, password: string) => {
    try {
      const response = await authService.login({ username, password })
      user.value = response.user
      return response
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    user.value = null
  }

  const checkAuth = () => {
    return authService.isAuthenticated()
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  }
}
