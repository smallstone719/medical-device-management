<template>
  <div>
    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Xóa người dùng"
      :message="`Bạn có chắc muốn xóa người dùng &quot;${deletingUser?.full_name}&quot;? Hành động này không thể hoàn tác.`"
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
          class="no-scrollbar relative w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-8 mx-4"
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
              {{ showEditModal ? 'Sửa người dùng' : 'Thêm người dùng mới' }}
            </h3>
            <p class="text-theme-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {{ showEditModal ? 'Cập nhật thông tin người dùng' : 'Nhập thông tin người dùng' }}
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="handleSubmit" class="space-y-5 px-2">
            <!-- Họ tên - Full width -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Họ và tên <span class="text-red-500">*</span>
              </label>
              <input
                v-model="formData.full_name"
                type="text"
                placeholder="Nhập họ và tên"
                required
                class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>

            <!-- Row 1: Tên đăng nhập + Vai trò -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Tên đăng nhập <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.username"
                  type="text"
                  placeholder="Nhập tên đăng nhập"
                  required
                  :disabled="showEditModal"
                  class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Vai trò <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <select
                    v-model="formData.role"
                    required
                    class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option v-for="option in ROLE_OPTIONS" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </option>
                  </select>
                  <span class="absolute text-gray-700 -translate-y-1/2 pointer-events-none right-3 top-1/2 dark:text-gray-400">
                    <svg class="stroke-current" width="16" height="16" viewBox="0 0 20 20" fill="none">
                      <path d="M4.79175 7.396L10.0001 12.6043L15.2084 7.396" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </div>
            </div>

            <!-- Row 2: Mật khẩu + Khoa phòng -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <!-- Mật khẩu (chỉ khi tạo mới) -->
              <div v-if="!showEditModal">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Mật khẩu <span class="text-red-500">*</span>
                </label>
                <input
                  v-model="formData.password"
                  type="password"
                  placeholder="Nhập mật khẩu"
                  required
                  class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>

              <!-- Khoa phòng -->
              <div :class="showEditModal ? 'sm:col-span-2' : ''">
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Khoa phòng
                </label>
                <div class="relative">
                  <select
                    v-model="formData.department_id"
                    class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
                  >
                    <option :value="null">-- Không có --</option>
                    <option 
                      v-for="dept in departments" 
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
            </div>

            <!-- Row 3: Email + Số điện thoại -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Email
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  placeholder="Nhập email"
                  class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>

              <div>
                <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Số điện thoại
                </label>
                <input
                  v-model="formData.phone_number"
                  type="tel"
                  placeholder="Nhập số điện thoại"
                  class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
                />
              </div>
            </div>

            <!-- Zalo ID - Full width -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Zalo ID
              </label>
              <input
                v-model="formData.zalo_id"
                type="text"
                placeholder="Nhập Zalo ID"
                class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
              <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">ID Zalo để nhận thông báo qua Zalo Bot</p>
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
          <h3 class="text-xl font-semibold text-gray-800 dark:text-white/90">Quản lý người dùng</h3>
          <p class="text-theme-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Quản lý tài khoản và phân quyền
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
        <div class="relative flex-1">
          <div class="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              class="fill-gray-500 dark:fill-gray-400"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M3.04175 9.37363C3.04175 5.87693 5.87711 3.04199 9.37508 3.04199C12.8731 3.04199 15.7084 5.87693 15.7084 9.37363C15.7084 12.8703 12.8731 15.7053 9.37508 15.7053C5.87711 15.7053 3.04175 12.8703 3.04175 9.37363ZM9.37508 1.54199C5.04902 1.54199 1.54175 5.04817 1.54175 9.37363C1.54175 13.6991 5.04902 17.2053 9.37508 17.2053C11.2674 17.2053 13.003 16.5344 14.357 15.4176L17.177 18.238C17.4699 18.5309 17.9448 18.5309 18.2377 18.238C18.5306 17.9451 18.5306 17.4703 18.2377 17.1774L15.418 14.3573C16.5365 13.0033 17.2084 11.2669 17.2084 9.37363C17.2084 5.04817 13.7011 1.54199 9.37508 1.54199Z"
                fill=""
              />
            </svg>
          </div>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Tìm kiếm người dùng..."
            @keyup.enter="handleSearch"
            class="h-11 w-full rounded-lg border border-gray-200 bg-white pl-12 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-800 dark:bg-gray-900 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30"
            :class="filters.search ? 'pr-40' : 'pr-20'"
          />
          <button
            v-if="filters.search"
            @click="handleClearSearch"
            class="absolute right-[80px] top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.05]"
            title="Xóa tìm kiếm"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Xóa</span>
          </button>
          <button
            @click="handleSearch"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-500 hover:bg-gray-100 transition-colors dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-400 dark:hover:bg-white/[0.05]"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span>Tìm</span>
          </button>
        </div>
        <div class="relative z-20 bg-transparent flex-1">
          <select
            v-model="filters.role"
            class="h-11 w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 pr-11 text-sm text-gray-800 shadow-theme-xs focus:border-blue-500 focus:outline-none focus:ring-3 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
          >
            <option value="">Tất cả vai trò</option>
            <option v-for="option in ROLE_OPTIONS" :key="option.value" :value="option.value">
              {{ option.label }}
            </option>
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
              <th class="py-3 text-left" style="min-width: 120px">
                <p class="text-xs uppercase font-medium text-gray-400 dark:text-gray-400">Tên đăng nhập</p>
              </th>
              <th class="py-3 text-left" style="min-width: 150px">
                <p class="text-xs uppercase font-medium text-gray-400 dark:text-gray-400">Họ và tên</p>
              </th>
              <th class="py-3 text-left" style="min-width: 120px">
                <p class="text-xs uppercase font-medium text-gray-400 dark:text-gray-400">Vai trò</p>
              </th>
              <th class="py-3 text-left" style="min-width: 120px">
                <p class="text-xs uppercase font-medium text-gray-400 dark:text-gray-400">Khoa phòng</p>
              </th>
              <th class="py-3 text-left" style="min-width: 100px">
                <p class="text-xs uppercase font-medium text-gray-400 dark:text-gray-400">Trạng thái</p>
              </th>
              <th class="py-3 text-right" style="min-width: 100px">
                <p class="text-xs uppercase font-medium text-gray-400 dark:text-gray-400">Thao tác</p>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loading">
              <td colspan="6" class="py-8 text-center">
                <div class="flex justify-center">
                  <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              </td>
            </tr>
            <tr v-else-if="users.length === 0">
              <td colspan="6" class="py-8 text-center">
                <div class="flex flex-col items-center justify-center gap-3">
                  <svg class="h-16 w-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p class="text-gray-500 dark:text-gray-400">Không có người dùng nào</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="user in users"
              :key="user.id"
              class="border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-white/[0.02]"
            >
              <td class="py-3 whitespace-nowrap">
                <p class="font-medium text-gray-700 text-theme-sm dark:text-gray-300">
                  {{ user.username }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <p class="font-medium text-gray-700 text-theme-sm dark:text-gray-300">
                  {{ user.full_name }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <span
                  :class="[
                    'rounded-full px-2.5 py-1 text-sm font-medium',
                    getRoleColorClasses(user.role as UserRole)
                  ]"
                >
                  {{ getRoleLabel(user.role as UserRole) }}
                </span>
              </td>
              <td class="py-3 whitespace-nowrap">
                <p class="text-gray-500 text-theme-sm dark:text-gray-400">
                  {{ user.department_name || '-' }}
                </p>
              </td>
              <td class="py-3 whitespace-nowrap">
                <span
                  :class="[
                    'rounded-full px-2.5 py-1 text-sm font-medium',
                    getStatusColorClasses(!!user.is_active)
                  ]"
                >
                  {{ getStatusLabel(!!user.is_active) }}
                </span>
              </td>
              <td class="py-3 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editUser(user)"
                    class="rounded-lg p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10"
                    title="Sửa"
                  >
                    <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteUser(user)"
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
              người dùng
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
                  @change="loadUsers"
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
                :disabled="users.length < filters.limit"
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
              người dùng
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
                  @change="loadUsers"
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
                :disabled="users.length < filters.limit"
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
import userService, { type User } from '@/services/user.service'
import departmentService, { type Department } from '@/services/department.service'
import { useToast } from '@/composables/useToast'
import Modal from '@/components/ui/Modal.vue'
import ConfirmDialog from '@/components/ui/ConfirmDialog.vue'
import { ROLE_OPTIONS, getRoleLabel, getRoleColorClasses, type UserRole } from '@/constants/roles'
import { getStatusLabel, getStatusColorClasses } from '@/constants/status'

const { success, error: showError } = useToast()

const users = ref<User[]>([])
const departments = ref<Department[]>([])
const loading = ref(false)
const total = ref(0)
const showCreateModal = ref(false)
const showEditModal = ref(false)
const submitting = ref(false)
const editingUser = ref<User | null>(null)
const showDeleteConfirm = ref(false)
const deletingUser = ref<User | null>(null)

const formData = ref({
  username: '',
  full_name: '',
  email: '',
  phone_number: '',
  password: '',
  role: 'viewer' as 'admin' | 'inspector' | 'technician' | 'viewer',
  department_id: null as number | null,
  zalo_id: '',
  is_active: true,
})

const filters = ref({
  search: '',
  role: '',
  page: 1,
  limit: 20,
})

const loadUsers = async () => {
  try {
    loading.value = true
    const response = await userService.getAll(filters.value)
    
    users.value = response.data || []
    total.value = response.pagination?.total || response.data?.length || 0
  } catch (err: any) {
    console.error('Load users error:', err)
    showError('Không thể tải danh sách người dùng')
  } finally {
    loading.value = false
  }
}

const loadDepartments = async () => {
  try {
    const response = await departmentService.getAll({ limit: 1000 })
    departments.value = (response as any).data || response
  } catch (err: any) {
    console.error('Load departments error:', err)
  }
}

const closeModal = () => {
  showCreateModal.value = false
  showEditModal.value = false
  editingUser.value = null
  formData.value = {
    username: '',
    full_name: '',
    email: '',
    phone_number: '',
    password: '',
    role: 'viewer',
    department_id: null,
    zalo_id: '',
    is_active: true,
  }
}

const handleSubmit = async () => {
  try {
    submitting.value = true
    
    if (showEditModal.value && editingUser.value) {
      const { password, ...updateData } = formData.value
      await userService.update(editingUser.value.id, updateData as any)
      success('Cập nhật người dùng thành công')
    } else {
      await userService.create(formData.value as any)
      success('Thêm người dùng thành công')
    }
    
    closeModal()
    loadUsers()
  } catch (err: any) {
    console.error('Submit error:', err)
    
    let errorMessage = 'Không thể lưu người dùng'
    
    if (err.message) {
      if (err.message.includes('UNIQUE constraint failed: users.username')) {
        errorMessage = 'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.'
      } else if (err.message.includes('UNIQUE constraint failed')) {
        errorMessage = 'Dữ liệu đã tồn tại trong hệ thống.'
      } else {
        errorMessage = err.message
      }
    }
    
    showError(errorMessage)
  } finally {
    submitting.value = false
  }
}

const editUser = (user: User) => {
  editingUser.value = user
  formData.value = {
    username: user.username,
    full_name: user.full_name,
    email: user.email || '',
    phone_number: user.phone_number || '',
    password: '',
    role: user.role,
    department_id: user.department_id || null,
    zalo_id: user.zalo_id || '',
    is_active: !!user.is_active,
  }
  showEditModal.value = true
}

const deleteUser = (user: User) => {
  deletingUser.value = user
  showDeleteConfirm.value = true
}

const confirmDelete = async () => {
  if (!deletingUser.value) return

  try {
    await userService.delete(deletingUser.value.id)
    success('Xóa người dùng thành công')
    showDeleteConfirm.value = false
    deletingUser.value = null
    loadUsers()
  } catch (err: any) {
    console.error('Delete error:', err)
    showError('Không thể xóa người dùng')
    showDeleteConfirm.value = false
    deletingUser.value = null
  }
}

const cancelDelete = () => {
  showDeleteConfirm.value = false
  deletingUser.value = null
}

const prevPage = () => {
  if (filters.value.page && filters.value.page > 1) {
    filters.value.page--
    loadUsers()
  }
}

const nextPage = () => {
  filters.value.page = (filters.value.page || 1) + 1
  loadUsers()
}

const handleSearch = () => {
  filters.value.page = 1
  loadUsers()
}

const handleClearSearch = () => {
  filters.value.search = ''
  filters.value.page = 1
  loadUsers()
}

watch(() => filters.value.role, () => {
  filters.value.page = 1
  loadUsers()
})

onMounted(() => {
  loadUsers()
  loadDepartments()
})
</script>
