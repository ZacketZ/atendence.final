import { request } from '@/utils/request'
import type {
  AttendanceRecord,
  AttendanceQueryParams,
  AttendanceModificationRequest,
  StudentAttendanceStats,
  ClassAttendanceStats,
  DateTrendData,
  LateDurationStats,
  DashboardData,
  ExportOptions,
} from '@/types/attendance'

/**
 * @description 考勤活动接口
 */
export interface Activity {
  id: number
  teacher_id: number
  title: string
  longitude: number
  latitude: number
  radius: number
  start_time: string
  end_time: string
  qr_refresh_interval?: number
  created_at: string
}

/**
 * @description 创建考勤活动参数
 */
export interface CreateActivityData {
  title: string
  longitude: number
  latitude: number
  radius: number
  start_time: string
  end_time: string
  qr_refresh_interval?: number
}

/**
 * @description 打卡记录接口
 */
export interface Record {
  id: number
  user_id: number
  activity_id: number
  check_time: string
  gps_longitude: number
  gps_latitude: number
  liveness_result?: string
  device_info?: string
  status?: string
  created_at: string
}

/**
 * @description 学生打卡请求参数
 */
export interface CheckinData {
  activity_id: number
  check_time: string
  gps_longitude: number
  gps_latitude: number
  liveness_result?: string
  device_info?: string
}

/**
 * @description 创建考勤活动（教师权限）
 * @param {CreateActivityData} data - 活动信息
 * @returns {Promise<Activity>}
 * @example
 * const activity = await createActivity({
 *   title: '高等数学签到',
 *   longitude: 116.397,
 *   latitude: 39.908,
 *   radius: 200,
 *   start_time: '2024-01-15 08:00:00',
 *   end_time: '2024-01-15 08:30:00'
 * })
 */
export const createActivity = (data: CreateActivityData): Promise<Activity> => {
  return request.post<Activity>('/activities', data)
}

/**
 * @description 获取教师的考勤活动列表
 * @returns {Promise<Activity[]>}
 * @example
 * const activities = await getTeacherActivities()
 */
export const getTeacherActivities = (): Promise<Activity[]> => {
  return request.get<Activity[]>('/activities/teacher')
}

/**
 * @description 获取单个考勤活动详情
 * @param {number} id - 活动 ID
 * @returns {Promise<Activity>}
 */
export const getActivityById = (id: number): Promise<Activity> => {
  return request.get<Activity>(`/activities/${id}`)
}

/**
 * @description 更新考勤活动（教师权限）
 * @param {number} id - 活动 ID
 * @param {CreateActivityData} data - 更新数据
 * @returns {Promise<{ message: string }>}
 */
export const updateActivity = (id: number, data: Partial<CreateActivityData>): Promise<{ message: string }> => {
  return request.put(`/activities/${id}`, data)
}

/**
 * @description 删除考勤活动（教师权限）
 * @param {number} id - 活动 ID
 * @returns {Promise<{ message: string }>}
 */
export const deleteActivity = (id: number): Promise<{ message: string }> => {
  return request.delete(`/activities/${id}`)
}

/**
 * @description 获取当前活跃的考勤活动（学生端）
 * @returns {Promise<Activity[]>}
 * @example
 * const activeList = await getCurrentActivities()
 */
export const getCurrentActivities = (): Promise<Activity[]> => {
  return request.get<Activity[]>('/activities/active/current')
}

/**
 * @description 学生打卡签到
 * @param {CheckinData} data - 打卡数据
 * @returns {Promise<Record>}
 * @example
 * const record = await createRecord({
 *   activity_id: 1,
 *   check_time: '2024-01-15 08:25:00',
 *   gps_longitude: 116.397,
 *   gps_latitude: 39.908
 * })
 */
export const createRecord = (data: CheckinData): Promise<Record> => {
  return request.post<Record>('/records', data)
}

/**
 * @description 获取学生的打卡记录
 * @returns {Promise<Record[]>}
 */
export const getStudentRecords = (): Promise<Record[]> => {
  return request.get<Record[]>('/records/student')
}

/**
 * @description 获取活动的打卡记录（教师权限）
 * @param {number} activityId - 活动 ID
 * @returns {Promise<Record[]>}
 */
export const getActivityRecords = (activityId: number): Promise<Record[]> => {
  return request.get<Record[]>(`/records/activity/${activityId}`)
}

/**
 * @description 获取考勤记录（管理员端，后端待实现）
 * @param {AttendanceQueryParams} params - 查询参数
 * @returns {Promise<{ records: AttendanceRecord[]; total: number; page: number; pageSize: number }>}
 */
export const getAttendanceRecords = (
  params: AttendanceQueryParams
): Promise<{ records: AttendanceRecord[]; total: number; page: number; pageSize: number }> => {
  return request.get('/records', params)
}

/**
 * @description 修改考勤状态（管理员端，后端待实现）
 * @param {AttendanceModificationRequest} req - 修改请求
 * @returns {Promise<void>}
 */
export const modifyAttendanceStatus = (req: AttendanceModificationRequest): Promise<void> => {
  return request.post('/records/modify', req)
}

/**
 * @description 导出考勤数据（后端待实现）
 * @param {AttendanceQueryParams} params - 查询参数
 * @param {ExportOptions} options - 导出选项
 * @returns {Promise<{ url: string }>}
 */
export const exportAttendanceData = (
  params: AttendanceQueryParams,
  options: ExportOptions
): Promise<{ url: string }> => {
  return request.post('/records/export', { ...params, ...options })
}

/**
 * @description 获取学生考勤统计（后端待实现）
 * @param {object} params - 筛选参数
 * @returns {Promise<StudentAttendanceStats[]>}
 */
export const getStudentAttendanceStats = (params?: {
  startDate?: string
  endDate?: string
  className?: string
}): Promise<StudentAttendanceStats[]> => {
  return request.get('/statistics/students', params)
}

/**
 * @description 获取班级考勤统计（后端待实现）
 * @returns {Promise<ClassAttendanceStats[]>}
 */
export const getClassAttendanceStats = (): Promise<ClassAttendanceStats[]> => {
  return request.get('/statistics/classes')
}

/**
 * @description 获取日期趋势数据（后端待实现）
 * @returns {Promise<DateTrendData[]>}
 */
export const getDateTrendData = (): Promise<DateTrendData[]> => {
  return request.get('/statistics/trend')
}

/**
 * @description 获取迟到时长分布（后端待实现）
 * @returns {Promise<LateDurationStats[]>}
 */
export const getLateDurationStats = (): Promise<LateDurationStats[]> => {
  return request.get('/statistics/late-duration')
}

/**
 * @description 获取看板数据（后端待实现）
 * @returns {Promise<DashboardData>}
 */
export const getDashboardData = (): Promise<DashboardData> => {
  return request.get('/statistics/dashboard')
}
