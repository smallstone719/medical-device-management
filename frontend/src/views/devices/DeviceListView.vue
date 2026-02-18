<template>
  <div class="devices">
    <h1>Devices</h1>
    <button @click="showAddDialog = true" class="btn btn-primary">Add Device</button>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Name</th>
          <th>Model</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="device in devices" :key="device.id">
          <td>{{ device.id }}</td>
          <td>{{ device.name }}</td>
          <td>{{ device.model }}</td>
          <td>{{ device.status }}</td>
          <td>
            <button @click="viewDevice(device.id)">View</button>
            <button @click="deleteDevice(device.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useDeviceStore } from '@/stores/device.store';
import { useRouter } from 'vue-router';

const deviceStore = useDeviceStore();
const router = useRouter();
const devices = ref([]);
const showAddDialog = ref(false);

onMounted(async () => {
  await deviceStore.fetchDevices();
  devices.value = deviceStore.devices;
});

const viewDevice = (id) => {
  router.push(`/devices/${id}`);
};

const deleteDevice = async (id) => {
  if (confirm('Delete this device?')) {
    await deviceStore.deleteDevice(id);
    devices.value = deviceStore.devices;
  }
};
</script>

<style scoped>
.devices {
  padding: 20px;
}

table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
</style>
