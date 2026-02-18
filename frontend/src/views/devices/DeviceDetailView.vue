<template>
  <div class="device-detail">
    <h1>Device Details</h1>
    <div v-if="device" class="detail-card">
      <p><strong>Name:</strong> {{ device.name }}</p>
      <p><strong>Model:</strong> {{ device.model }}</p>
      <p><strong>Serial Number:</strong> {{ device.serial_number }}</p>
      <p><strong>Status:</strong> {{ device.status }}</p>
      <p><strong>Location:</strong> {{ device.location }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useDeviceStore } from '@/stores/device.store';

const route = useRoute();
const deviceStore = useDeviceStore();
const device = ref(null);

onMounted(async () => {
  await deviceStore.fetchDevice(route.params.id);
  device.value = deviceStore.currentDevice;
});
</script>

<style scoped>
.device-detail {
  padding: 20px;
}

.detail-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}
</style>
