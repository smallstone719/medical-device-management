<template>
  <div class="settings">
    <h1>Settings</h1>
    <div class="settings-card">
      <h3>Application Settings</h3>
      <form>
        <label>Theme</label>
        <select v-model="theme">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
        
        <label>Language</label>
        <select v-model="language">
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
        </select>
        
        <button type="submit" class="btn btn-primary">Save</button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const theme = ref('light');
const language = ref('vi');
</script>

<style scoped>
.settings {
  padding: 20px;
}

.settings-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-top: 20px;
}

label {
  display: block;
  margin: 10px 0 5px;
}

select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
</style>
