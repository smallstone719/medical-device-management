<template>
  <div class="upload-form">
    <input 
      type="file" 
      ref="fileInput"
      @change="handleFileChange"
      accept="image/*"
    />
    <button @click="upload" :disabled="!file" class="btn btn-primary">
      Upload
    </button>
    <div v-if="preview" class="preview">
      <img :src="preview" alt="Preview" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['upload']);

const file = ref(null);
const preview = ref('');
const fileInput = ref(null);

const handleFileChange = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;
    preview.value = URL.createObjectURL(selectedFile);
  }
};

const upload = () => {
  if (file.value) {
    emit('upload', file.value);
  }
};
</script>

<style scoped>
.upload-form {
  padding: 20px;
}

.preview {
  margin-top: 16px;
}

.preview img {
  max-width: 300px;
  border-radius: 8px;
}
</style>
