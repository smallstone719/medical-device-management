<template>
  <div class="relative" ref="dropdownRef">
    <button
      class="flex items-center text-gray-700 dark:text-gray-400"
      @click.prevent="toggleDropdown"
    >
      <span class="mr-3 overflow-hidden rounded-full h-11 w-11 bg-blue-100 flex items-center justify-center dark:bg-blue-500/15">
        <span class="text-lg font-semibold text-blue-600 dark:text-blue-400">
          {{ userInitial }}
        </span>
      </span>

      <span class="block mr-1 font-medium text-theme-sm">{{ userName }}</span>

      <ChevronDownIcon :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <!-- Dropdown Start -->
    <div
      v-if="dropdownOpen"
      class="absolute right-0 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
    >
      <div>
        <span class="block font-medium text-gray-700 text-theme-sm dark:text-gray-400">
          {{ currentUser?.full_name || 'User' }}
        </span>
        <span class="mt-0.5 block text-theme-xs text-gray-500 dark:text-gray-400">
          {{ currentUser?.email || 'user@example.com' }}
        </span>
        <span class="mt-1 inline-block px-2 py-0.5 text-theme-xs rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
          {{ roleLabel }}
        </span>
      </div>

      <ul class="flex flex-col gap-1 pt-4 pb-3 border-b border-gray-200 dark:border-gray-800">
        <li v-for="item in menuItems" :key="item.href">
          <router-link
            :to="item.href"
            class="flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          >
            <component
              :is="item.icon"
              class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
            />
            {{ item.text }}
          </router-link>
        </li>
      </ul>
      <button
        @click="handleSignOut"
        class="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300 w-full text-left"
      >
        <LogoutIcon
          class="text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
        />
        Đăng xuất
      </button>
    </div>
    <!-- Dropdown End -->
  </div>
</template>

<script setup lang="ts">
import { ChevronDownIcon, InfoCircleIcon, LogoutIcon, SettingsIcon, UserCircleIcon } from '@/icons'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import authService from '@/services/auth.service'

const router = useRouter()
const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const currentUser = ref(authService.getCurrentUser())

const menuItems = [
  { href: '/profile', icon: UserCircleIcon, text: 'Thông tin cá nhân' },
  { href: '/profile', icon: SettingsIcon, text: 'Cài đặt tài khoản' },
  { href: '/profile', icon: InfoCircleIcon, text: 'Hỗ trợ' },
]

const userName = computed(() => {
  if (!currentUser.value) return 'User'
  const fullName = currentUser.value.full_name || currentUser.value.username
  const parts = fullName.split(' ')
  return parts.length > 1 ? parts[parts.length - 1] : fullName
})

const userInitial = computed(() => {
  if (!currentUser.value) return 'U'
  const name = currentUser.value.full_name || currentUser.value.username
  return name.charAt(0).toUpperCase()
})

const roleLabel = computed(() => {
  if (!currentUser.value) return ''
  const roleMap: Record<string, string> = {
    admin: 'Quản trị viên',
    inspector: 'Kiểm tra viên',
    technician: 'Kỹ thuật viên',
    viewer: 'Người xem'
  }
  return roleMap[currentUser.value.role] || currentUser.value.role
})

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value
}

const closeDropdown = () => {
  dropdownOpen.value = false
}

const handleSignOut = () => {
  authService.logout()
  closeDropdown()
  router.push('/signin')
}

const handleClickOutside = (event: Event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
