/**
 * @description 申诉/请假 API 模块
 * 从 attendance 模块独立拆分，职责单一
 */
import { request } from '@/utils/request'
import type { AppealTypeValue, AppealStatusValue } from '@/constants'

/**
 * @description 申诉/请假接口
 */
export interface Appeal {
  id: number
  user_id: number
  activity_id: number
  type: AppealTypeValue
  reason: string
  status: AppealStatusValue
  admin_comment?: string
  created_at: string
}

/**
 * @description 提交申诉/请假参数
 */
export interface CreateAppealData {
  activity_id: number
  type: AppealTypeValue
  reason: string
}

/**
 * @description 审核申诉参数
 */
export interface ReviewAppealData {
  status: Exclude<AppealStatusValue, 'pending'>
  admin_comment?: string
}

/**
 * @description 学生提交申诉/请假
 * @param {CreateAppealData} data - 申诉数据
 * @returns {Promise<Appeal>}
 * @example
 * await createAppeal({ activity_id: 1, type: 'leave', reason: '病假' })
 */
export const createAppeal = (data: CreateAppealData): Promise<Appeal> => {
  return request.post<Appeal>('/appeals', data)
}

/**
 * @description 获取学生的申诉/请假记录
 * @returns {Promise<Appeal[]>}
 * @example
 * const appeals = await getStudentAppeals()
 */
export const getStudentAppeals = (): Promise<Appeal[]> => {
  return request.get<Appeal[]>('/appeals/student')
}

/**
 * @description 获取待审核的申诉/请假（教师权限）
 * @returns {Promise<Appeal[]>}
 * @example
 * const pending = await getPendingAppeals()
 */
export const getPendingAppeals = (): Promise<Appeal[]> => {
  return request.get<Appeal[]>('/appeals/pending')
}

/**
 * @description 审核申诉/请假（教师权限）
 * @param {number} id - 申诉 ID
 * @param {ReviewAppealData} data - 审核数据
 * @returns {Promise<{ message: string }>}
 * @example
 * await reviewAppeal(1, { status: 'approved', admin_comment: '同意' })
 */
export const reviewAppeal = (id: number, data: ReviewAppealData): Promise<{ message: string }> => {
  return request.put(`/appeals/${id}`, data)
}
