<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <div class="stats">
      <div class="stat-card">
        <h3>Total Devices</h3>
        <p>{{ deviceCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Active</h3>
        <p>{{ activeCount }}</p>
      </div>
      <div class="stat-card">
        <h3>Maintenance</h3>
        <p>{{ maintenanceCount }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const deviceCount = ref(0);
const activeCount = ref(0);
const maintenanceCount = ref(0);

onMounted(() => {
  // Fetch stats
});
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
