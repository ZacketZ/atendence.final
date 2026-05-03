/**
 * @description 全局常量定义
 * 包含存储键名、角色映射、错误码、状态枚举等
 */

// ==================== 存储键名 ====================

/**
 * @description localStorage 存储键名常量
 */
export const TOKEN_KEY = 'access_token'
export const REFRESH_TOKEN_KEY = 'refresh_token'
export const USER_INFO_KEY = 'userInfo'

// ==================== 角色相关 ====================

/**
 * @description 前端角色类型（路由、权限使用）
 */
export type FrontendRole = 'admin' | 'staff' | 'student'

/**
 * @description 后端角色类型（API 响应使用）
 */
export type BackendRole = 'admin' | 'teacher' | 'student'

/**
 * @description 后端角色到前端角色的映射
 * 后端使用 'teacher'，前端路由使用 'staff'
 * @example
 * const frontendRole = ROLE_MAP[backendRole] // 'teacher' → 'staff'
 */
export const ROLE_MAP: Record<string, FrontendRole> = {
  admin: 'admin',
  teacher: 'staff',
  student: 'student',
}

/**
 * @description 角色默认首页路径映射
 * @example
 * const homePath = ROLE_HOME_MAP[userRole] // 'admin' → '/admin/dashboard'
 */
export const ROLE_HOME_MAP: Record<string, string> = {
  admin: '/admin/dashboard',
  staff: '/staff/dashboard',
  student: '/student/dashboard',
}

/**
 * @description 路由白名单（无需登录即可访问的路径）
 */
export const WHITE_LIST = ['/login', '/test', '/403']

// ==================== HTTP 错误码 ====================

/**
 * @description HTTP 状态码 → 中文错误提示映射
 */
export const ERROR_CODE_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '权限不足，无法访问',
  404: '请求的资源不存在',
  408: '请求超时',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
}

/**
 * @description 业务错误码 → 中文错误提示映射
 * 与后端 Apifox 定义的错误码对齐
 */
export const BIZ_CODE_MAP: Record<number, string> = {
  10001: '用户名或密码错误',
  10002: '用户名已存在',
  10003: '学号已存在',
  10004: '原密码错误',
  10005: 'Token 已失效',
  20001: '活动不存在',
  20002: '活动未开始或已结束',
  20003: '已签到，请勿重复签到',
  30001: '申诉不存在',
  30002: '已提交过相同类型的申请',
}

// ==================== 考勤状态 ====================

/**
 * @description 考勤状态常量
 * @example
 * if (record.status === ATTENDANCE_STATUS.LATE) { showLateTip() }
 */
export const ATTENDANCE_STATUS = {
  NORMAL: 'normal',
  LATE: 'late',
  ABSENT: 'absent',
  LEAVE: 'leave',
} as const

/**
 * @description 考勤状态值类型
 * 'normal' | 'late' | 'absent' | 'leave'
 */
export type AttendanceStatusValue = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS]

// ==================== 申诉类型 ====================

/**
 * @description 申诉类型常量
 */
export const APPEAL_TYPE = {
  APPEAL: 'appeal',
  LEAVE: 'leave',
} as const

/**
 * @description 申诉类型值
 * 'appeal' | 'leave'
 */
export type AppealTypeValue = (typeof APPEAL_TYPE)[keyof typeof APPEAL_TYPE]

// ==================== 申诉状态 ====================

/**
 * @description 申诉状态常量
 */
export const APPEAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const

/**
 * @description 申诉状态值类型
 * 'pending' | 'approved' | 'rejected'
 */
export type AppealStatusValue = (typeof APPEAL_STATUS)[keyof typeof APPEAL_STATUS]
