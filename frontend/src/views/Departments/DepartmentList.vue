<template>
  <div>
    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Xóa khoa phòng"
      :message="`Bạn có chắc muốn xóa khoa phòng &quot;${deletingDepartment?.name}&quot;? Hành động này không thể hoàn tác.`"
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
              {{ showEditModal ? 'Sửa khoa phòng' : 'Thêm khoa phòng mới' }}
            </h3>
            <p class="text-theme-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ showEditModal ? 'Cập nhật thông tin khoa phòng' : 'Nhập thông tin khoa phòng' }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5 px-2">
            <!-- Mã khoa phòng -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mã khoa phòng <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.code"
                type="text"
                placeholder="Nhập mã khoa phòng (VD: CDHA, HSCC)"
                required
                class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            <!-- Tên khoa phòng -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Tên khoa phòng <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.name"
                type="text"
                placeholder="Nhập tên khoa phòng"
                required
                class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            <!-- Khoa phòng cha -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Khoa phòng cha
              </label>
              <div class="relative">
                <select
                  v-model="formData.parent_id"
                  class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                >
                  <option :value="null">-- Không có --</option>
                  <option 
                    v-for="dept in departments.filter(d => !editingDepartment || d.id !== editingDepartment.id)" 
                    :key="dept.id" 
                    :value="dept.id"
                  >
                    {{ dept.name }}
                  </option>
                </select>
                <span class="absolute text-gray-700 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                  <svg class="stroke-current" width="16" height="16" viewBox="0 0 20 20" fill="none">
                    <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  </svg>
                </span>
              </div>
            </div>

            <!-- Mô tả -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Mô tả
              </label>
              <textarea
                v-model="formData.description"
                rows="3"
                placeholder="Nhập mô tả khoa phòng"
                class="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              ></textarea>
            </div>

            <!-- Form Actions -->
            <div class="flex items-center justify-between gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <!-- Trạng thái -->
              <div class="flex items-center gap-3">
                <label class="flex items-center cursor-pointer">
                  <input
                    v-model="formData.is_active"
                    type="checkbox"
                    class="sr-only"
                  />
                  <div
                    :class="[
                      'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                      formData.is_active ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-700'
                    ]"
                  >
                    <span
                      :class="[
                        'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                        formData.is_active ? 'translate-x-6' : 'translate-x-1'
                      ]"
                    ></span>
                  </div>
                  <span class="ml-3 text-sm text-gray-700 dark:text-gray-400">
                    {{ formData.is_active ? 'Hoạt động' : 'Không hoạt động' }}
                  </span>
                </label>
              </div>

              <!-- Buttons -->
              <div class="flex items-center gap-3">
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
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white/90">Khoa phòng</h3>
          <p class="text-theme-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý cơ cấu khoa, phòng
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
      <div class="flex flex-col gap-3 mb-4 sm:flex-row">
        <input
          v-model="filters.search"
          type="text"
          placeholder="Tìm kiếm..."
          class="h-11 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
        />
        <div class="relative z-20 bg-transparent flex-1">
          <select
            v-model="filters.is_active"
            class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Tất cả</option>
            <option value="1">Hoạt động</option>
            <option value="0">Không hoạt động</option>
          </select>
          <span class="absolute z-30 text-gray-700 -translate-y-1/2 pointer-events-none right-4 top-1/2 dark:text-gray-400">
            <svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
        </div>
      </div>

      <!-- Table -->
      <div class="max-w-full overflow-x-auto custom-scrollbar">
        <table class="min-w-full">
          <thead>
            <tr class="border-t border-gray-100 dark:border-gray-800">
              <th class="py-3 text-left" style="min-width: 100px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Mã khoa phòng</p>
              </th>
              <th class="py-3 text-left" style="min-width: 150px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Tên khoa phòng</p>
              </th>
              <th class="py-3 text-left" style="min-width: 120px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Khoa phòng cha</p>
              </th>
              <th class="py-3 text-left" style="min-width: 120px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Quản lý</p>
              </th>
              <th class="py-3 text-left" style="min-width: 110px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Số thành viên</p>
              </th>
              <th class="py-3 text-left" style="min-width: 120px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Trạng thái</p>
              </th>
              <th class="py-3 text-right" style="min-width: 100px">
                <p class="font-medium text-gray-500 text-theme-sm dark:text-gray-400">Thao tác</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="7" class="py-8 text-center">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="departments.length === 0">
              <td colspan="7" class="py-8 text-center">
                <p class="text-gray-500 dark:text-gray-400">Không có khoa phòng nào</p>
              </td>
            </tr>
            <tr
              v-else
              v-for="department in departments"
              :key="department.id"
              class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            >
              <td class="py-3 whitespace-nowrap">
                <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {{ department.code }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <p class="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                  {{ department.name }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                  {{ department.parent_name || '-' }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <div v-if="department.manager_name" class="flex items-center gap-2">
                  <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center dark:bg-blue-500/15">
                    <span class="text-theme-sm font-medium text-blue-600 dark:text-blue-400">
                      {{ department.manager_name.charAt(0) }}
                    </span>
                  </div>
                  <span class="text-gray-500 text-theme-sm dark:text-gray-400">
                    {{ department.manager_name }}
                  </span>
                </div>
                <p v-else class="text-gray-500 text-theme-sm dark:text-gray-400">-</p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <span
                  class="rounded-full bg-purple-50 px-2 py-0.5 text-theme-sm font-medium text-purple-600 dark:bg-purple-500/15 dark:text-purple-400"
                >
                  {{ department.member_count || 0 }} người
                </span>
              </td>
              <td class="py-3 whitespace-nowrap">
                <span
                  :class="{
                    'rounded-full px-2 py-0.5 text-theme-sm font-medium': true,
                    'bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500': department.is_active,
                    'bg-gray-100 text-gray-600 dark:bg-gray-500/15 dark:text-gray-400': !department.is_active,
                  }"
                >
                  {{ department.is_active ? 'Hoạt động' : 'Không hoạt động' }}
                </span>
              </td>
              <td class="py-3 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editDepartment(department)"
                    class="rounded-lg p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    title="Sửa"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteDepartment(department)"
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
              khoa phòng
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
                  @change="loadDepartments"
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
                :disabled="departments.length < filters.limit"
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
              khoa phòng
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
                  @change="loadDepartments"
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
                :disabled="departments.length < filters.limit"
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
import { ref, onMounted, watch } from 'vue'
import departmentService, { type Department } from '@/services/department.service'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'

const { success, error: showError } = useToast()

const departments = ref<Department[]>([])
const loading = ref(false)
const total = ref(0)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingDepartment = ref<Department | null>(null)
const showDeleteConfirm = ref(false)
const deletingDepartment = ref<Department | null>(null)

const formData = ref({
  code: '',
  name: '',
  description: '',
  parent_id: null as number | null,
  is_active: true,
})

const filters = ref({
  search: '',
  is_active: '',
  page: 1,
  limit: 20,
})

const loadDepartments = async () => {
  try {
    loading.value = true
    console.log('Loading departments with filters:', filters.value)
    const response = await departmentService.getAll(filters.value)
    console.log('Response:', response)
    console.log('Response.data length:', response.data?.length)
    
    // Response có cấu trúc: {success, message, data, pagination}
    if (response.data && Array.isArray(response.data)) {
      departments.value = [...response.data] // Force reactivity
      total.value = response.pagination?.total || response.data.length
      console.log('Updated departments.value length:', departments.value.length)
    } else {
      // Fallback cho trường hợp response trực tiếp là array
      departments.value = response.data || response
      total.value = response.total || departments.value.length
    }
  } catch (err: any) {
    console.error('Load departments error:', err)
    
    let errorMessage = 'Không thể tải danh sách khoa phòng'
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
  editingDepartment.value = null
  formData.value = {
    code: '',
    name: '',
    description: '',
    parent_id: null,
    is_active: true,
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    console.log('Submitting form data:', formData.value)
    
    if (showEditModal.value && editingDepartment.value) {
      const result = await departmentService.update(editingDepartment.value.id, formData.value)
      console.log('Update result:', result)
      success('Cập nhật khoa phòng thành công')
    } else {
      const result = await departmentService.create(formData.value)
      console.log('Create result:', result)
      success('Thêm khoa phòng thành công')
    }
    
    closeModal()
    loadDepartments()
  } catch (err: any) {
    console.error('Submit error:', err)
    
    // Parse error message to show user-friendly message
    let errorMessage = 'Không thể lưu khoa phòng'
    
    if (err.message) {
      if (err.message.includes('UNIQUE constraint failed: departments.code')) {
        errorMessage = 'Mã khoa phòng đã tồn tại. Vui lòng chọn mã khác.'
      } else if (err.message.includes('UNIQUE constraint failed: departments.name')) {
        errorMessage = 'Tên khoa phòng đã tồn tại. Vui lòng chọn tên khác.'
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

const editDepartment = (department: Department) => {
  editingDepartment.value = department
  formData.value = {
    code: department.code || '',
    name: department.name,
    description: department.description || '',
    parent_id: department.parent_id || null,
    is_active: department.is_active === true || department.is_active === 1,
  }
  showEditModal.value = true
}

const deleteDepartment = (department: Department) => {
  deletingDepartment.value = department
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!deletingDepartment.value) return

  try {
    await departmentService.delete(deletingDepartment.value.id)
    success('Xóa khoa phòng thành công')
    showDeleteConfirm.value = false
    deletingDepartment.value = null
    loadDepartments()
  } catch (err: any) {
    console.error('Delete error:', err)
    
    // Parse error message to show user-friendly message
    let errorMessage = 'Không thể xóa khoa phòng'
    
    if (err.message) {
      if (err.message.includes('FOREIGN KEY constraint failed') || err.message.includes('còn có')) {
        errorMessage = 'Không thể xóa khoa phòng này vì còn có dữ liệu liên quan (nhân viên, thiết bị, v.v.).'
      } else if (err.message.includes('not found') || err.message.includes('không tìm thấy')) {
        errorMessage = 'Khoa phòng không tồn tại hoặc đã bị xóa.'
      } else {
        errorMessage = err.message
      }
    }
    
    showError(errorMessage)
    showDeleteConfirm.value = false
    deletingDepartment.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deletingDepartment.value = null
}

const prevPage = () => {
  if (filters.value.page && filters.value.page > 1) {
    filters.value.page--
    loadDepartments()
  }
}

const nextPage = () => {
  filters.value.page = (filters.value.page || 1) + 1
  loadDepartments()
}

// Watch for filter changes
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(() => filters.value.search, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    filters.value.page = 1
    loadDepartments()
  }, 500) // Debounce 500ms
})

watch(() => filters.value.is_active, () => {
  filters.value.page = 1
  loadDepartments()
})

onMounted(() => {
  loadDepartments()
})
</script>
