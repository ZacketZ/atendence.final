/**
 * @description 用户相关类型定义
 * 整合前端状态、API 响应、认证等用户类型
 */
import type { FrontendRole, BackendRole } from '@/constants'
import { ROLE_MAP } from '@/constants'

export type { FrontendRole, BackendRole }

// ==================== 核心用户类型 ====================

/**
 * @description 用户信息接口（前端 Store 状态使用）
 * 角色字段为前端映射后的 FrontendRole
 */
export interface UserInfo {
  id: number
  username: string
  role: FrontendRole
  student_id?: string
  name?: string
  status?: number
  avatar?: string
}

/**
 * @description 登录响应接口（与后端 AuthService.login 返回对齐）
 * @example
 * const result: LoginResult = await login('admin', '123456')
 * userStore.setUser(result)
 */
export interface LoginResult {
  token: string
  user: UserInfo
}

// ==================== API 请求/响应类型 ====================

/**
 * @description 用户个人信息接口（API 响应，后端原始角色）
 */
export interface UserProfile {
  id: number
  username: string
  student_id: string
  name: string
  role: string
  status: number
  avatar?: string
}

/**
 * @description 修改密码请求参数
 */
export interface ChangePasswordData {
  oldPassword: string
  newPassword: string
}

/**
 * @description 注册请求参数
 */
export interface RegisterData {
  username: string
  student_id: string
  name: string
}

// ==================== 角色映射工具 ====================

/**
 * @description 将后端角色映射为前端角色
 * 后端 'teacher' → 前端 'staff'
 * @param {BackendRole} role - 后端返回的角色
 * @returns {FrontendRole} 前端路由使用的角色
 * @example
 * const frontendRole = mapRole('teacher') // 'staff'
 */
export function mapRole(role: BackendRole): FrontendRole {
  return ROLE_MAP[role] || 'student'
}
