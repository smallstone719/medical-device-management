<template>
  <div class="qrcode">
    <img v-if="qrUrl" :src="qrUrl" alt="QR Code" />
    <button @click="generate" class="btn btn-primary">Generate QR</button>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
});

const qrUrl = ref('');

const generate = async () => {
  // Call API to generate QR code
  console.log('Generating QR for:', props.data);
};
</script>

<style scoped>
.qrcode {
  text-align: center;
}

img {
  max-width: 200px;
  margin-bottom: 16px;
}
</style>
