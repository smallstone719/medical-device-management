<template>
  <header class="app-header">
    <div class="logo">Medical Device Management</div>
    <nav>
      <router-link to="/">Dashboard</router-link>
      <router-link to="/devices">Devices</router-link>
      <router-link to="/settings">Settings</router-link>
    </nav>
    <div class="user-menu">
      <span>{{ user?.username }}</span>
      <button @click="handleLogout" class="btn">Logout</button>
    </div>
  </header>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';

const { user, logout } = useAuth();

const handleLogout = () => {
  logout();
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

nav a {
  margin: 0 12px;
  text-decoration: none;
  color: #333;
}

nav a.router-link-active {
  color: #1976d2;
  font-weight: bold;
}
</style>
