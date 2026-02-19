<template>
  <div>
    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Xóa loại thiết bị"
      :message="`Bạn có chắc muốn xóa loại thiết bị &quot;${deletingCategory?.name}&quot;? Hành động này không thể hoàn tác.`"
      confirmText="Xóa"
      cancelText="Hủy"
      variant="danger"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />

    <!-- Create/Edit Modal -->
    <Modal v-if="showCreateModal || showEditModal" :fullScreenBackdrop="true" @close="closeModal">
      <template #body>
        <div
          class="no-scrollbar relative w-full max-w-[600px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8 mx-4"
        >
          <!-- Close button -->
          <button
            @click="closeModal"
            class="transition-color absolute right-5 top-5 z-999 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600 dark:bg-gray-700 dark:bg-white/[0.05] dark:text-gray-400 dark:hover:bg-white/[0.07] dark:hover:text-gray-300"
          >
            <svg class="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M6.04289 16.5418C5.65237 16.9323 5.65237 17.5655 6.04289 17.956C6.43342 18.3465 7.06658 18.3465 7.45711 17.956L11.9987 13.4144L16.5408 17.9565C16.9313 18.347 17.5645 18.347 17.955 17.9565C18.3455 17.566 18.3455 16.9328 17.955 16.5423L13.4129 12.0002L17.955 7.45808C18.3455 7.06756 18.3455 6.43439 17.955 6.04387C17.5645 5.65335 16.9313 5.65335 16.5408 6.04387L11.9987 10.586L7.45711 6.04439C7.06658 5.65386 6.43342 5.65386 6.04289 6.04439C5.65237 6.43491 5.65237 7.06808 6.04289 7.4586L10.5845 12.0002L6.04289 16.5418Z"
                fill=""
              />
            </svg>
          </button>

          <!-- Modal Header -->
          <div class="px-2 pr-14 mb-6">
            <h3 class="text-xl font-semibold text-gray-800 dark:text-white/90">
              {{ showEditModal ? 'Sửa loại thiết bị' : 'Thêm loại thiết bị mới' }}
            </h3>
            <p class="text-theme-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ showEditModal ? 'Cập nhật thông tin loại thiết bị' : 'Nhập thông tin loại thiết bị y tế' }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5 px-2">
            <!-- Loại thiết bị -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Loại thiết bị <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Nhập loại thiết bị"
                required
                class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            <!-- Mô tả -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mô tả
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Nhập mô tả loại thiết bị"
                class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              ></textarea>
            </div>

            <!-- Màu sắc -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Màu sắc <span class="text-red-500">*</span>
              </label>
              <div class="flex items-center gap-3">
                <input
                  v-model="formData.color"
                  type="color"
                  required
                  class="h-11 w-20 cursor-pointer rounded-lg border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
                />
                <input
                  v-model="formData.color"
                  type="text"
                  placeholder="#000000"
                  required
                  class="h-11 flex-1 appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                type="button"
                @click="closeModal"
                class="h-11 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Hủy
              </button>
              <button
                type="submit"
                :disabled="submitting"
                class="h-11 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {{ submitting ? 'Đang xử lý...' : (showEditModal ? 'Cập nhật' : 'Thêm mới') }}
              </button>
            </div>
          </form>
        </div>
      </template>
    </Modal>

    <!-- Table Card -->
    <div
      class="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6"
    >
      <!-- Card Header -->
      <div class="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white/90">Loại thiết bị</h3>
          <p class="text-theme-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý nhóm thiết bị y tế
          </p>
        </div>

        <button
          @click="showCreateModal = true"
          class="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-theme-xs hover:bg-blue-700 whitespace-nowrap flex-shrink-0"
        >
          <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Thêm
        </button>
      </div>

      <!-- Filters -->
      <div class="mb-4">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm kiếm..."
          class="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
      </div>

      <!-- Table -->
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <table class="min-w-full">
          <thead>
            <tr class="border-t border-gray-100 dark:border-gray-800">
              <th class="py-3 text-left" style="min-width: 150px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Loại thiết bị</p>
              </th>
              <th class="py-3 text-left" style="min-width: 200px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Mô tả</p>
              </th>
              <th class="py-3 text-left" style="min-width: 100px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Màu sắc</p>
              </th>
              <th class="py-3 text-left" style="min-width: 100px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Số thiết bị</p>
              </th>
              <th class="py-3 text-right" style="min-width: 100px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Thao tác</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="5" class="py-8 text-center">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="categories.length === 0">
              <td colspan="5" class="py-8 text-center">
                <p class="text-gray-500 dark:text-gray-400">Không có loại thiết bị nào</p>
              </td>
            </tr>
            <tr
              v-else
              v-for="category in categories"
              :key="category.id"
              class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            >
              <td class="py-3 whitespace-nowrap">
                <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {{ category.name }}
                </p>
              </td>
              <td class="py-3">
                <p class="text-gray-500 text-theme-sm dark:text-gray-400 max-w-xs truncate">
                  {{ category.description || '-' }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <div
                    :style="{ backgroundColor: category.color }"
                    class="h-6 w-6 rounded border border-gray-300 dark:border-gray-700"
                  ></div>
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                    {{ category.color }}
                  </span>
                </div>
              </td>
              <td class="py-3 whitespace-nowrap">
                <span
                  class="rounded-full bg-blue-50 px-2 py-0.5 text-theme-sm font-medium text-blue-600 dark:bg-blue-500/15 dark:text-blue-400"
                >
                  {{ category.device_count || 0 }} thiết bị
                </span>
              </td>
              <td class="py-3 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editCategory(category)"
                    class="rounded-lg p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    title="Sửa"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteCategory(category)"
                    class="rounded-lg p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                    title="Xóa"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
        <!-- Mobile Layout -->
        <div class="flex flex-col gap-3 sm:hidden">
          <!-- Row 1: Items info -->
          <div class="flex items-center justify-center">
            <p class="text-theme-sm text-gray-600 dark:text-gray-400">
              <span class="font-medium text-gray-800 dark:text-white/90">
                {{ (filters.page - 1) * filters.limit + 1 }}-{{ Math.min(filters.page * filters.limit, total) }}
              </span>
              /
              <span class="font-medium text-gray-800 dark:text-white/90">{{ total }}</span>
              loại thiết bị
            </p>
          </div>
          
          <!-- Row 2: Controls -->
          <div class="flex items-center justify-between">
            <!-- Items per page -->
            <div class="flex items-center gap-2">
              <span class="text-theme-sm text-gray-600 dark:text-gray-400">Hiển thị</span>
              <div class="relative">
                <select
                  v-model="filters.limit"
                  @change="loadCategories"
                  class="h-9 appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 pr-8 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="absolute text-gray-700 -translate-y-1/2 pointer-events-none right-2 top-1/2 dark:text-gray-400">
                  <svg class="stroke-current" width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Page navigation -->
            <div class="flex items-center gap-1">
              <button
                @click="prevPage"
                :disabled="filters.page === 1"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                title="Trang trước"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div class="flex items-center gap-1.5 px-2">
                <span class="text-theme-sm text-gray-600 dark:text-gray-400">Trang</span>
                <span class="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {{ filters.page }}
                </span>
                <span class="text-theme-sm text-gray-600 dark:text-gray-400">/</span>
                <span class="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {{ Math.ceil(total / filters.limit) || 1 }}
                </span>
              </div>

              <button
                @click="nextPage"
                :disabled="categories.length < filters.limit"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                title="Trang sau"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Desktop Layout -->
        <div class="hidden sm:flex sm:items-center sm:justify-between">
          <!-- Left: Items info -->
          <div class="flex items-center gap-3">
            <p class="text-theme-sm text-gray-600 dark:text-gray-400">
              <span class="font-medium text-gray-800 dark:text-white/90">
                {{ (filters.page - 1) * filters.limit + 1 }}-{{ Math.min(filters.page * filters.limit, total) }}
              </span>
              /
              <span class="font-medium text-gray-800 dark:text-white/90">{{ total }}</span>
              loại thiết bị
            </p>
          </div>

          <!-- Right: Pagination controls -->
          <div class="flex items-center gap-2">
            <!-- Items per page -->
            <div class="flex items-center gap-2">
              <span class="text-theme-sm text-gray-600 dark:text-gray-400">Hiển thị</span>
              <div class="relative">
                <select
                  v-model="filters.limit"
                  @change="loadCategories"
                  class="h-9 appearance-none rounded-lg border border-gray-300 bg-white px-3 py-1.5 pr-8 text-theme-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90"
                >
                  <option :value="10">10</option>
                  <option :value="20">20</option>
                  <option :value="50">50</option>
                  <option :value="100">100</option>
                </select>
                <span class="absolute text-gray-700 -translate-y-1/2 pointer-events-none right-2 top-1/2 dark:text-gray-400">
                  <svg class="stroke-current" width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Divider -->
            <div class="h-6 w-px bg-gray-200 dark:bg-gray-700"></div>

            <!-- Page navigation -->
            <div class="flex items-center gap-1">
              <button
                @click="prevPage"
                :disabled="filters.page === 1"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                title="Trang trước"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div class="flex items-center gap-1.5 px-2">
                <span class="text-theme-sm text-gray-600 dark:text-gray-400">Trang</span>
                <span class="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {{ filters.page }}
                </span>
                <span class="text-theme-sm text-gray-600 dark:text-gray-400">/</span>
                <span class="text-theme-sm font-semibold text-gray-800 dark:text-white/90">
                  {{ Math.ceil(total / filters.limit) || 1 }}
                </span>
              </div>

              <button
                @click="nextPage"
                :disabled="categories.length < filters.limit"
                class="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-theme-xs transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
                title="Trang sau"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import categoryService, { type Category } from '@/services/category.service'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const { success, error: showError } = useToast()

const categories = ref<Category[]>([])
const loading = ref(false)
const total = ref(0)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingCategory = ref<Category | null>(null)
const showDeleteConfirm = ref(false)
const deletingCategory = ref<Category | null>(null)

const formData = ref({
  name: '',
  description: '',
  color: '#3B82F6',
})

const filters = ref({
  search: '',
  page: 1,
  limit: 20,
})

const loadCategories = async () => {
  try {
    loading.value = true
    const response = await categoryService.getAll(filters.value)
    categories.value = response.data || response
    total.value = response.total || categories.value.length
  } catch (err: any) {
    console.error('Load categories error:', err)
    
    let errorMessage = 'Không thể tải danh sách loại thiết bị'
    if (err.message && !err.message.includes('Failed to fetch')) {
      errorMessage = err.message
    }
    
    showError(errorMessage)
  } finally {
    loading.value = false
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingCategory.value = null
  formData.value = {
    name: '',
    description: '',
    color: '#3B82F6',
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    console.log('Submitting form data:', formData.value)
    
    if (showEditModal.value && editingCategory.value) {
      const result = await categoryService.update(editingCategory.value.id, formData.value)
      console.log('Update result:', result)
      success('Cập nhật loại thiết bị thành công')
    } else {
      const result = await categoryService.create(formData.value)
      console.log('Create result:', result)
      success('Thêm loại thiết bị thành công')
    }
    
    closeModal()
    loadCategories()
  } catch (err: any) {
    console.error('Submit error:', err)
    
    // Parse error message to show user-friendly message
    let errorMessage = 'Không thể lưu loại thiết bị'
    
    if (err.message) {
      if (err.message.includes('UNIQUE constraint failed: device_categories.name')) {
        errorMessage = 'Loại thiết bị đã tồn tại. Vui lòng kiểm tra lại.'
      } else if (err.message.includes('UNIQUE constraint failed')) {
        errorMessage = 'Dữ liệu đã tồn tại trong hệ thống.'
      } else if (err.message.includes('NOT NULL constraint failed')) {
        errorMessage = 'Vui lòng điền đầy đủ thông tin bắt buộc.'
      } else if (err.message.includes('FOREIGN KEY constraint failed')) {
        errorMessage = 'Dữ liệu liên quan không hợp lệ.'
      } else {
        errorMessage = err.message
      }
    }
    
    showError(errorMessage)
  } finally {
    submitting.value = false
  }
}

const editCategory = (category: Category) => {
  editingCategory.value = category
  formData.value = {
    name: category.name,
    description: category.description || '',
    color: category.color,
  }
  showEditModal.value = true
}

const deleteCategory = (category: Category) => {
  deletingCategory.value = category
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!deletingCategory.value) return

  try {
    await categoryService.delete(deletingCategory.value.id)
    success('Xóa loại thiết bị thành công')
    showDeleteConfirm.value = false
    deletingCategory.value = null
    loadCategories()
  } catch (err: any) {
    console.error('Delete error:', err)
    
    // Parse error message to show user-friendly message
    let errorMessage = 'Không thể xóa loại thiết bị'
    
    if (err.message) {
      if (err.message.includes('FOREIGN KEY constraint failed') || err.message.includes('còn có thiết bị')) {
        errorMessage = 'Không thể xóa loại thiết bị này vì còn có thiết bị đang sử dụng.'
      } else if (err.message.includes('not found') || err.message.includes('không tìm thấy')) {
        errorMessage = 'Loại thiết bị không tồn tại hoặc đã bị xóa.'
      } else {
        errorMessage = err.message
      }
    }
    
    showError(errorMessage)
    showDeleteConfirm.value = false
    deletingCategory.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deletingCategory.value = null
}

const prevPage = () => {
  if (filters.value.page && filters.value.page > 1) {
    filters.value.page--
    loadCategories()
  }
}

const nextPage = () => {
  filters.value.page = (filters.value.page || 1) + 1
  loadCategories()
}

onMounted(() => {
  loadCategories()
})
</script>
