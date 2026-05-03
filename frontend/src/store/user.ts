import { defineStore } from 'pinia'
import { ref } from 'vue'
import { setToken, clearAuth, getToken } from '@/utils/auth'
import { USER_INFO_KEY } from '@/constants'
import type { UserInfo, LoginResult, BackendRole } from '@/types/user'
import { mapRole } from '@/types/user'

export const useUserStore = defineStore('user', () => {
  const userInfo = ref<UserInfo | null>(null)

  /**
   * @description 设置用户信息并持久化 Token（自动做角色映射）
   * @param {LoginResult} loginResult - 登录返回的完整数据
   */
  const setUser = (loginResult: LoginResult) => {
    const { token, user } = loginResult
    const mappedUser: UserInfo = {
      ...user,
      role: mapRole(user.role as BackendRole)
    }
    userInfo.value = mappedUser
    setToken(token)
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(mappedUser))
  }

  /**
   * @description 清除用户状态和认证信息
   */
  const clearUser = () => {
    userInfo.value = null
    clearAuth()
  }

  /**
   * @description 从 localStorage 恢复用户状态
   */
  const loadUser = () => {
    const saved = localStorage.getItem(USER_INFO_KEY)
    const token = getToken()
    if (saved && token) {
      try {
        userInfo.value = JSON.parse(saved)
      } catch {
        clearUser()
      }
    } else {
      clearUser()
    }
  }

  loadUser()

  return {
    userInfo,
    setUser,
    clearUser
  }
})
