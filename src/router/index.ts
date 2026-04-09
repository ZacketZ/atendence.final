import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/store/user'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/admin/home',
    name: 'AdminHome',
    component: () => import('@/views/admin/home.vue'),
    meta: { requiresAuth: true, role: 'admin' }
  },
  {
    path: '/staff/home',
    name: 'StaffHome',
    component: () => import('@/views/staff/home.vue'),
    meta: { requiresAuth: true, role: 'staff' }
  },
  {
    path: '/student/home',
    name: 'StudentHome',
    component: () => import('@/views/student/home.vue'),
    meta: { requiresAuth: true, role: 'student' }
  },
  {
    path: '/',
    redirect: '/login'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.userInfo) {
    next('/login')
    return
  }

  if (to.meta.role && userStore.userInfo?.role !== to.meta.role) {
    next(`/${userStore.userInfo?.role}/home`)
    return
  }

  if (to.path === '/login' && userStore.userInfo) {
    next(`/${userStore.userInfo.role}/home`)
    return
  }

  next()
})

export default router
