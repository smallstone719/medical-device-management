<template>
  <Modal v-if="show" :fullScreenBackdrop="true" @close="handleCancel">
    <template #body>
      <div
        class="no-scrollbar relative w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 dark:bg-gray-900 mx-4"
      >
        <!-- Icon -->
        <div class="flex justify-center mb-4">
          <div
            :class="[
              'flex items-center justify-center w-16 h-16 rounded-full',
              variant === 'danger' ? 'bg-red-100 dark:bg-red-500/10' : 'bg-blue-100 dark:bg-blue-500/10'
            ]"
          >
            <svg
              v-if="variant === 'danger'"
              class="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <svg
              v-else
              class="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        <!-- Title -->
        <h3 class="text-xl font-semibold text-center text-gray-800 dark:text-white/90 mb-2">
          {{ title }}
        </h3>

        <!-- Message -->
        <p class="text-center text-gray-500 dark:text-gray-400 mb-6">
          {{ message }}
        </p>

        <!-- Actions -->
        <div class="flex items-center gap-3">
          <button
            @click="handleCancel"
            type="button"
            class="flex-1 h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {{ cancelText }}
          </button>
          <button
            @click="handleConfirm"
            type="button"
            :class="[
              'flex-1 h-11 rounded-lg px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs',
              variant === 'danger'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            ]"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import Modal from './Modal.vue'

interface Props {
  show: boolean
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'info'
}

withDefaults(defineProps<Props>(), {
  title: 'Xác nhận',
  message: 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  variant: 'danger'
})

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
