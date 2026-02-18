<template>
  <div class="fixed top-4 right-4 z-50 space-y-2">
    <transition-group name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="getToastClass(toast.type)"
        class="min-w-[300px] rounded-lg p-4 shadow-lg flex items-center gap-3"
      >
        <div class="flex-shrink-0">
          <component :is="getIcon(toast.type)" class="h-5 w-5" />
        </div>
        <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
        <button @click="remove(toast.id)" class="flex-shrink-0 hover:opacity-70">
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useToast, type ToastType } from '@/composables/useToast'
import { CheckIcon, ErrorIcon, WarningIcon, InfoCircleIcon } from '@/icons'

const { toasts, remove } = useToast()

const getToastClass = (type: ToastType) => {
  const classes = {
    success: 'bg-green-50 text-green-800 border border-green-200',
    error: 'bg-red-50 text-red-800 border border-red-200',
    warning: 'bg-yellow-50 text-yellow-800 border border-yellow-200',
    info: 'bg-blue-50 text-blue-800 border border-blue-200',
  }
  return classes[type]
}

const getIcon = (type: ToastType) => {
  const icons = {
    success: CheckIcon,
    error: ErrorIcon,
    warning: WarningIcon,
    info: InfoCircleIcon,
  }
  return icons[type]
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>
