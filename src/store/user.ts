import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface UserInfo {
  id: number
  username: string
  role: 'admin' | 'staff' | 'student'
  token: string
  avatar?: string
}

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  const setUser = (info: UserInfo) => {
    userInfo.value = info
    localStorage.setItem('userInfo', JSON.stringify(info))
  }

  const clearUser = () => {
    userInfo.value = null
    localStorage.removeItem('userInfo')
  }

  const loadUser = () => {
    const saved = localStorage.getItem('userInfo')
    if (saved) {
      try {
        userInfo.value = JSON.parse(saved)
      } catch (e) {
        localStorage.removeItem('userInfo')
      }
    }
  }

  // 初始化时从 localStorage 加载
  loadUser()

  return {
    userInfo,
    setUser,
    clearUser
  }
})
