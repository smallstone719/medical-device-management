import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'vue-router';

export function useAuth() {
  const authStore = useAuthStore();
  const router = useRouter();

  const login = async (credentials) => {
    await authStore.login(credentials);
    router.push('/');
  };

  const logout = () => {
    authStore.logout();
    router.push('/login');
  };

  return {
    user: authStore.user,
    isAuthenticated: authStore.isAuthenticated,
    login,
    logout
  };
}
