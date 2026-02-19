<template>
  <div>
    <div class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p class="text-gray-600 dark:text-gray-400 mt-1">Tổng quan hệ thống quản lý thiết bị y tế</p>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <div v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Tổng thiết bị</p>
              <p class="text-2xl font-bold text-gray-900 dark:text-white">
                {{ stats?.total_devices || 0 }}
              </p>
            </div>
            <div class="rounded-full bg-blue-100 p-3 dark:bg-blue-900">
              <BoxIcon class="h-6 w-6 text-blue-600 dark:text-blue-300" />
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Đang hoạt động</p>
              <p class="text-2xl font-bold text-green-600">
                {{ stats?.active_devices || 0 }}
              </p>
            </div>
            <div class="rounded-full bg-green-100 p-3 dark:bg-green-900">
              <CheckIcon class="h-6 w-6 text-green-600 dark:text-green-300" />
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Bảo trì</p>
              <p class="text-2xl font-bold text-yellow-600">
                {{ stats?.maintenance_devices || 0 }}
              </p>
            </div>
            <div class="rounded-full bg-yellow-100 p-3 dark:bg-yellow-900">
              <WarningIcon class="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
            </div>
          </div>
        </div>

        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 dark:text-gray-400">Hỏng hóc</p>
              <p class="text-2xl font-bold text-red-600">
                {{ stats?.broken_devices || 0 }}
              </p>
            </div>
            <div class="rounded-full bg-red-100 p-3 dark:bg-red-900">
              <ErrorIcon class="h-6 w-6 text-red-600 dark:text-red-300" />
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Row -->
      <div class="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Thiết bị theo danh mục
          </h3>
          <div v-if="stats?.devices_by_category?.length">
            <div
              v-for="item in stats.devices_by_category"
              :key="item.category_name"
              class="mb-3"
            >
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.category_name }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.count }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  class="bg-blue-600 h-2 rounded-full"
                  :style="{ width: `${(item.count / (stats?.total_devices || 1)) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
        </div>

        <div class="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Thiết bị theo phòng ban
          </h3>
          <div v-if="stats?.devices_by_department?.length">
            <div
              v-for="item in stats.devices_by_department"
              :key="item.department_name"
              class="mb-3"
            >
              <div class="flex justify-between mb-1">
                <span class="text-sm text-gray-600 dark:text-gray-400">{{ item.department_name }}</span>
                <span class="text-sm font-medium text-gray-900 dark:text-white">{{ item.count }}</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div
                  class="bg-green-600 h-2 rounded-full"
                  :style="{ width: `${(item.count / (stats?.total_devices || 1)) * 100}%` }"
                ></div>
              </div>
            </div>
          </div>
          <p v-else class="text-gray-500 dark:text-gray-400">Chưa có dữ liệu</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import statisticsService, { type Statistics } from '@/services/statistics.service'
import { BoxIcon, CheckIcon, WarningIcon, ErrorIcon } from '@/icons'

const stats = ref<Statistics | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const loadStatistics = async () => {
  try {
    loading.value = true
    error.value = null
    stats.value = await statisticsService.getOverview()
  } catch (err: any) {
    error.value = err.message || 'Không thể tải dữ liệu thống kê'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadStatistics()
})
</script>
