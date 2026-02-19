import { createRouter, createWebHistory } from 'vue-router'
import authService from '@/services/auth.service'
import AdminLayout from '@/components/layout/AdminLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior(_to, _from, savedPosition) {
    return savedPosition || { left: 0, top: 0 }
  },
  routes: [
    {
      path: '/',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'Dashboard',
          component: () => import('../views/Dashboard/Dashboard.vue'),
          meta: {
            title: 'Dashboard',
          },
        },
        {
          path: '/devices',
          name: 'Devices',
          component: () => import('../views/Devices/DeviceList.vue'),
          meta: {
            title: 'Quản lý thiết bị',
          },
        },
        {
          path: '/categories',
          name: 'Categories',
          component: () => import('../views/Categories/CategoryList.vue'),
          meta: {
            title: 'Loại thiết bị',
          },
        },
        {
          path: '/departments',
          name: 'Departments',
          component: () => import('../views/Departments/DepartmentList.vue'),
          meta: {
            title: 'Khoa phòng',
          },
        },
        {
          path: '/settings/users',
          name: 'Users',
          component: () => import('../views/Settings/UserList.vue'),
          meta: {
            title: 'Quản lý người dùng',
          },
        },
        {
          path: '/calendar',
          name: 'Calendar',
          component: () => import('../views/Others/Calendar.vue'),
          meta: {
            title: 'Calendar',
          },
        },
        {
          path: '/profile',
          name: 'Profile',
          component: () => import('../views/Others/UserProfile.vue'),
          meta: {
            title: 'Profile',
          },
        },
        {
          path: '/form-elements',
          name: 'Form Elements',
          component: () => import('../views/Forms/FormElements.vue'),
          meta: {
            title: 'Form Elements',
          },
        },
        {
          path: '/basic-tables',
          name: 'Basic Tables',
          component: () => import('../views/Tables/BasicTables.vue'),
          meta: {
            title: 'Basic Tables',
          },
        },
        {
          path: '/line-chart',
          name: 'Line Chart',
          component: () => import('../views/Chart/LineChart/LineChart.vue'),
        },
        {
          path: '/bar-chart',
          name: 'Bar Chart',
          component: () => import('../views/Chart/BarChart/BarChart.vue'),
        },
        {
          path: '/alerts',
          name: 'Alerts',
          component: () => import('../views/UiElements/Alerts.vue'),
          meta: {
            title: 'Alerts',
          },
        },
        {
          path: '/avatars',
          name: 'Avatars',
          component: () => import('../views/UiElements/Avatars.vue'),
          meta: {
            title: 'Avatars',
          },
        },
        {
          path: '/badge',
          name: 'Badge',
          component: () => import('../views/UiElements/Badges.vue'),
          meta: {
            title: 'Badge',
          },
        },
        {
          path: '/buttons',
          name: 'Buttons',
          component: () => import('../views/UiElements/Buttons.vue'),
          meta: {
            title: 'Buttons',
          },
        },
        {
          path: '/images',
          name: 'Images',
          component: () => import('../views/UiElements/Images.vue'),
          meta: {
            title: 'Images',
          },
        },
        {
          path: '/videos',
          name: 'Videos',
          component: () => import('../views/UiElements/Videos.vue'),
          meta: {
            title: 'Videos',
          },
        },
        {
          path: '/blank',
          name: 'Blank',
          component: () => import('../views/Pages/BlankPage.vue'),
          meta: {
            title: 'Blank',
          },
        },
      ],
    },
    {
      path: '/error-404',
      name: '404 Error',
      component: () => import('../views/Errors/FourZeroFour.vue'),
      meta: {
        title: '404 Error',
      },
    },
    {
      path: '/signin',
      name: 'Signin',
      component: () => import('../views/Auth/Signin.vue'),
      meta: {
        title: 'Đăng nhập',
        guest: true,
      },
    },
    {
      path: '/signup',
      name: 'Signup',
      component: () => import('../views/Auth/Signup.vue'),
      meta: {
        title: 'Đăng ký',
        guest: true,
      },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const isAuthenticated = authService.isAuthenticated()
  
  document.title = `${to.meta.title || 'Page'} | Medical Device Management`

  console.log('Router guard:', { 
    to: to.path, 
    from: from.path, 
    isAuthenticated,
    requiresAuth: to.meta.requiresAuth,
    guest: to.meta.guest
  })

  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Redirecting to signin - not authenticated')
    next('/signin')
  } else if (to.meta.guest && isAuthenticated) {
    console.log('Redirecting to home - already authenticated')
    next('/')
  } else {
    console.log('Allowing navigation')
    next()
  }
})

export default router
