import { defineStore } from 'pinia';

export const useAppStore = defineStore('app', {
  state: () => ({
    loading: false,
    sidebarOpen: true
  }),

  actions: {
    setLoading(value) {
      this.loading = value;
    },

    toggleSidebar() {
      this.sidebarOpen = !this.sidebarOpen;
    }
  }
});
