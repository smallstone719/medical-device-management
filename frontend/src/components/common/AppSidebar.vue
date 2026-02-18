<template>
  <aside class="sidebar" :class="{ open: isOpen }">
    <nav>
      <router-link to="/" class="nav-item">
        <span>Dashboard</span>
      </router-link>
      <router-link to="/devices" class="nav-item">
        <span>Devices</span>
      </router-link>
      <router-link to="/settings" class="nav-item">
        <span>Settings</span>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useAppStore } from '@/stores/app.store';

const appStore = useAppStore();
const isOpen = computed(() => appStore.sidebarOpen);
</script>

<style scoped>
.sidebar {
  width: 250px;
  background: #2c3e50;
  color: white;
  height: 100vh;
  padding: 20px 0;
}

.nav-item {
  display: block;
  padding: 12px 24px;
  color: white;
  text-decoration: none;
}

.nav-item:hover {
  background: #34495e;
}

.nav-item.router-link-active {
  background: #1976d2;
}
</style>
