import { request } from '@/utils/request'
import type { Activity, CreateActivityData, CheckinData, Record } from './attendance'

/**
 * @description 获取教师的考勤活动列表（复用 attendance 模块接口）
 * @returns {Promise<Activity[]>}
 * @example
 * const schedule = await getTeacherSchedule()
 */
export const getTeacherSchedule = (): Promise<Activity[]> => {
  return request.get<Activity[]>('/activities/teacher')
}

/**
 * @description 获取当前活跃的考勤活动（学生端课程表/签到入口）
 * @returns {Promise<Activity[]>}
 * @example
 * const courses = await getStudentSchedule()
 */
export const getStudentSchedule = (): Promise<Activity[]> => {
  return request.get<Activity[]>('/activities/active/current')
}

/**
 * @description 获取活动详情
 * @param {number} id - 活动 ID
 * @returns {Promise<Activity>}
 */
export const getActivityDetail = (id: number): Promise<Activity> => {
  return request.get<Activity>(`/activities/${id}`)
}

/**
 * @description 学生签到打卡（复用 records 接口）
 * @param {CheckinData} data - 签到数据
 * @returns {Promise<Record>}
 * @example
 * const result = await checkinCourse({
 *   activity_id: 1,
 *   check_time: '2024-01-15 08:25:00',
 *   gps_longitude: 116.397,
 *   gps_latitude: 39.908
 * })
 */
export const checkinCourse = (data: CheckinData): Promise<Record> => {
  return request.post<Record>('/records', data)
}

/**
 * @description 获取学生的签到记录
 * @returns {Promise<Record[]>}
 */
export const getCheckinRecords = (): Promise<Record[]> => {
  return request.get<Record[]>('/records/student')
}

/**
 * @description 创建考勤活动（教师端）
 * @param {CreateActivityData} data - 活动数据
 * @returns {Promise<Activity>}
 */
export const createActivity = (data: CreateActivityData): Promise<Activity> => {
  return request.post<Activity>('/activities', data)
}

/**
 * @description 更新考勤活动
 * @param {number} id - 活动 ID
 * @param {Partial<CreateActivityData>} data - 更新数据
 * @returns {Promise<{ message: string }>}
 */
export const updateActivity = (id: number, data: Partial<CreateActivityData>): Promise<{ message: string }> => {
  return request.put(`/activities/${id}`, data)
}

/**
 * @description 删除考勤活动
 * @param {number} id - 活动 ID
 * @returns {Promise<{ message: string }>}
 */
export const deleteActivity = (id: number): Promise<{ message: string }> => {
  return request.delete(`/activities/${id}`)
}
