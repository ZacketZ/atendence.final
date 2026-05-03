import { request } from '@/utils/request'
import { clearAuth } from '@/utils/auth'
import type { LoginResult, UserProfile, ChangePasswordData, RegisterData } from '@/types/user'

/**
 * @description 用户登录
 * @param {string} username - 用户名
 * @param {string} password - 密码
 * @returns {Promise<LoginResult>} 登录结果（含 token 和用户信息）
 * @example
 * const result = await login('admin', '123456')
 * userStore.setUser(result)
 */
export const login = (username: string, password: string): Promise<LoginResult> => {
  return request.post<LoginResult>('/auth/login', { username, password })
}

/**
 * @description 学生注册
 * @param {RegisterData} data - 注册信息
 * @returns {Promise<{ message: string }>}
 * @example
 * await register({ username: 'stu01', student_id: '20230001', name: '张三' })
 */
export const register = (data: RegisterData): Promise<{ message: string }> => {
  return request.post('/auth/register', data)
}

/**
 * @description 修改密码
 * @param {ChangePasswordData} data - 包含旧密码和新密码
 * @returns {Promise<{ message: string }>}
 * @example
 * await changePassword({ oldPassword: '123456', newPassword: '654321' })
 */
export const changePassword = (data: ChangePasswordData): Promise<{ message: string }> => {
  return request.post('/auth/change-password', data)
}

/**
 * @description 获取用户个人信息
 * @param {number} id - 用户 ID
 * @returns {Promise<UserProfile>}
 * @example
 * const profile = await getUserProfile(1)
 */
export const getUserProfile = (id: number): Promise<UserProfile> => {
  return request.get<UserProfile>(`/users/${id}`)
}

/**
 * @description 获取所有学生列表（教师权限）
 * @returns {Promise<UserProfile[]>}
 */
export const getStudents = (): Promise<UserProfile[]> => {
  return request.get<UserProfile[]>('/users/students')
}

/**
 * @description 获取所有教师列表（管理员权限）
 * @returns {Promise<UserProfile[]>}
 */
export const getTeachers = (): Promise<UserProfile[]> => {
  return request.get<UserProfile[]>('/users/teachers')
}

/**
 * @description 添加学生（教师权限）
 * @param {RegisterData} data - 学生信息
 * @returns {Promise<{ message: string }>}
 */
export const addStudent = (data: RegisterData): Promise<{ message: string }> => {
  return request.post('/users/students', data)
}

/**
 * @description 更新学生信息（教师权限）
 * @param {number} id - 学生 ID
 * @param {Partial<UserProfile>} data - 更新数据
 * @returns {Promise<{ message: string }>}
 */
export const updateStudent = (id: number, data: Partial<UserProfile>): Promise<{ message: string }> => {
  return request.put(`/users/students/${id}`, data)
}

/**
 * @description 删除学生（教师权限）
 * @param {number} id - 学生 ID
 * @returns {Promise<{ message: string }>}
 */
export const deleteStudent = (id: number): Promise<{ message: string }> => {
  return request.delete(`/users/students/${id}`)
}

/**
 * @description 登出（前端清除本地状态）
 */
export const logout = () => {
  clearAuth()
}

/**
 * @description 更新用户个人信息（后端待实现）
 * @param {object} data - 更新数据
 * @returns {Promise<void>}
 */
export const updateUserProfile = (data: Record<string, any>): Promise<void> => {
  return request.put('/users/profile', data)
}

/**
 * @description 上传头像（后端待实现）
 * @param {FormData} formData - 头像表单数据
 * @returns {Promise<{ avatarUrl: string }>}
 */
export const uploadAvatar = (formData: FormData): Promise<{ avatarUrl: string }> => {
  return request.upload('/users/avatar', formData)
}

/**
 * @description 获取通知偏好（后端待实现）
 * @returns {Promise<Record<string, boolean>>}
 */
export const getNotificationPreferences = (): Promise<Record<string, boolean>> => {
  return request.get('/users/notifications/preferences')
}

/**
 * @description 更新通知偏好（后端待实现）
 * @param {Record<string, any>} preferences - 偏好设置
 * @returns {Promise<void>}
 */
export const updateNotificationPreferences = (preferences: Record<string, any>): Promise<void> => {
  return request.put('/users/notifications/preferences', preferences)
}
