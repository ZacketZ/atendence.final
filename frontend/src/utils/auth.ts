/**
 * @description Token 认证工具
 * 负责 Token 的存取、清除，与 localStorage 交互
 */
import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_INFO_KEY } from '@/constants'

/**
 * @description 获取访问令牌
 * @returns {string | null} 令牌字符串，未登录时返回 null
 * @example
 * const token = getToken()
 * if (token) { headers.Authorization = `Bearer ${token}` }
 */
export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * @description 设置访问令牌
 * @param {string} token - JWT 令牌字符串
 * @example
 * setToken('eyJhbGciOiJIUzI1NiIs...')
 */
export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token)
}

/**
 * @description 获取刷新令牌
 * @returns {string | null} 刷新令牌字符串，不存在时返回 null
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

/**
 * @description 设置刷新令牌
 * @param {string} token - 刷新令牌字符串
 */
export function setRefreshToken(token: string): void {
  localStorage.setItem(REFRESH_TOKEN_KEY, token)
}

/**
 * @description 清除所有认证信息（访问令牌 + 刷新令牌 + 用户信息）
 * @example
 * clearAuth()
 * router.push('/login')
 */
export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
  localStorage.removeItem(USER_INFO_KEY)
}
