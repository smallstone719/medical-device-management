<template>
  <div>
    <div class="mb-6 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Quản lý thiết bị</h1>
        <p class="text-gray-600 dark:text-gray-400 mt-1">Danh sách thiết bị y tế</p>
      </div>
      <button
        @click="showCreateModal = true"
        class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        + Thêm thiết bị
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-6 rounded-lg bg-white p-4 shadow dark:bg-gray-800">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm kiếm..."
          class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          @input="loadDevices"
        />
        <select
          v-model="filters.status"
          class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          @change="loadDevices"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="active">Hoạt động</option>
          <option value="maintenance">Bảo trì</option>
          <option value="broken">Hỏng</option>
          <option value="retired">Ngừng sử dụng</option>
        </select>
        <select
          v-model="filters.category_id"
          class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          @change="loadDevices"
        >
          <option value="">Tất cả danh mục</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.id">
            {{ cat.name }}
          </option>
        </select>
        <select
          v-model="filters.department_id"
          class="rounded-lg border border-gray-300 px-4 py-2 dark:border-gray-600 dark:bg-gray-700"
          @change="loadDevices"
        >
          <option value="">Tất cả phòng ban</option>
          <option v-for="dept in departments" :key="dept.id" :value="dept.id">
            {{ dept.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Table -->
    <div class="rounded-lg bg-white shadow dark:bg-gray-800">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Mã thiết bị
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Tên thiết bị
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Danh mục
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Phòng ban
              </th>
              <th class="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                Trạng thái
              </th>
              <th class="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-if="loading">
              <td colspan="6" class="px-6 py-8 text-center">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="devices.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-gray-500">
                Không có thiết bị nào
              </td>
            </tr>
            <tr
              v-else
              v-for="device in devices"
              :key="device.id"
              class="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ device.code }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-900 dark:text-white">
                {{ device.name }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ getCategoryName(device.category_id) }}
              </td>
              <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                {{ getDepartmentName(device.department_id) }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="getStatusClass(device.status)"
                  class="inline-flex rounded-full px-2 py-1 text-xs font-semibold"
                >
                  {{ getStatusText(device.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right text-sm">
                <button
                  @click="viewDevice(device)"
                  class="text-blue-600 hover:text-blue-800 mr-3"
                >
                  Xem
                </button>
                <button
                  @click="editDevice(device)"
                  class="text-green-600 hover:text-green-800 mr-3"
                >
                  Sửa
                </button>
                <button
                  @click="deleteDevice(device)"
                  class="text-red-600 hover:text-red-800"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600 dark:text-gray-400">
            Hiển thị {{ devices.length }} / {{ total }} thiết bị
          </div>
          <div class="flex gap-2">
            <button
              @click="prevPage"
              :disabled="filters.page === 1"
              class="rounded-lg border px-3 py-1 disabled:opacity-50"
            >
              Trước
            </button>
            <button
              @click="nextPage"
              :disabled="devices.length < (filters.limit || 20)"
              class="rounded-lg border px-3 py-1 disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import deviceService, { type Device, type DeviceFilters } from '@/services/device.service'
import { useReferenceData } from '@/composables/useReferenceData'
import { useToast } from '@/composables/useToast'

const { success, error: showError } = useToast()
const { categories, departments, loadCategories, loadDepartments } = useReferenceData()

const devices = ref<Device[]>([])
const loading = ref(false)
const total = ref(0)
const showCreateModal = ref(false)

const filters = ref<DeviceFilters>({
  search: '',
  status: '',
  category_id: undefined,
  department_id: undefined,
  page: 1,
  limit: 20,
})

const loadDevices = async () => {
  try {
    loading.value = true
    const response = await deviceService.getAll(filters.value)
    devices.value = response.data
    total.value = response.total
  } catch (err: any) {
    showError(err.message || 'Không thể tải danh sách thiết bị')
  } finally {
    loading.value = false
  }
}

const getCategoryName = (id: number) => {
  return categories.value.find((c) => c.id === id)?.name || '-'
}

const getDepartmentName = (id: number) => {
  return departments.value.find((d) => d.id === id)?.name || '-'
}

const getStatusClass = (status: string) => {
  const classes = {
    active: 'bg-green-100 text-green-800',
    maintenance: 'bg-yellow-100 text-yellow-800',
    broken: 'bg-red-100 text-red-800',
    retired: 'bg-gray-100 text-gray-800',
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const getStatusText = (status: string) => {
  const texts = {
    active: 'Hoạt động',
    maintenance: 'Bảo trì',
    broken: 'Hỏng',
    retired: 'Ngừng sử dụng',
  }
  return texts[status as keyof typeof texts] || status
}

const viewDevice = (device: Device) => {
  // TODO: Navigate to device detail page
  console.log('View device:', device)
}

const editDevice = (device: Device) => {
  // TODO: Open edit modal
  console.log('Edit device:', device)
}

const deleteDevice = async (device: Device) => {
  if (!confirm(`Bạn có chắc muốn xóa thiết bị "${device.name}"?`)) return

  try {
    await deviceService.delete(device.id)
    success('Xóa thiết bị thành công')
    loadDevices()
  } catch (err: any) {
    showError(err.message || 'Không thể xóa thiết bị')
  }
}

const prevPage = () => {
  if (filters.value.page && filters.value.page > 1) {
    filters.value.page--
    loadDevices()
  }
}

const nextPage = () => {
  filters.value.page = (filters.value.page || 1) + 1
  loadDevices()
}

onMounted(() => {
  loadDevices()
  loadCategories()
  loadDepartments()
})
</script>
