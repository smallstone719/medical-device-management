<template>
  <div class="pagination">
    <button @click="prev" :disabled="page === 1" class="btn">Previous</button>
    <span>Page {{ page }} of {{ totalPages }}</span>
    <button @click="next" :disabled="page === totalPages" class="btn">Next</button>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  page: Number,
  limit: Number,
  total: Number
});

const emit = defineEmits(['update:page']);

const totalPages = computed(() => Math.ceil(props.total / props.limit));

const prev = () => {
  if (props.page > 1) {
    emit('update:page', props.page - 1);
  }
};

const next = () => {
  if (props.page < totalPages.value) {
    emit('update:page', props.page + 1);
  }
};
</script>

<style scoped>
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
