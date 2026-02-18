<template>
  <form @submit.prevent="handleSubmit" class="device-form">
    <div class="form-group">
      <label>Device Name</label>
      <input v-model="form.name" type="text" required />
    </div>
    
    <div class="form-group">
      <label>Model</label>
      <input v-model="form.model" type="text" />
    </div>
    
    <div class="form-group">
      <label>Serial Number</label>
      <input v-model="form.serial_number" type="text" />
    </div>
    
    <div class="form-group">
      <label>Manufacturer</label>
      <input v-model="form.manufacturer" type="text" />
    </div>
    
    <div class="form-group">
      <label>Location</label>
      <input v-model="form.location" type="text" />
    </div>
    
    <div class="form-group">
      <label>Status</label>
      <select v-model="form.status">
        <option value="active">Active</option>
        <option value="maintenance">Maintenance</option>
        <option value="retired">Retired</option>
      </select>
    </div>
    
    <button type="submit" class="btn btn-primary">Save</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['submit']);

const form = ref({
  name: '',
  model: '',
  serial_number: '',
  manufacturer: '',
  location: '',
  status: 'active'
});

const handleSubmit = () => {
  emit('submit', form.value);
};
</script>

<style scoped>
.device-form {
  max-width: 500px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

input, select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
