import { request } from "@/utils/request";
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
} from "@/types/attendance";

/**
 * @description 考勤活动接口
 */
export interface Activity {
  id: number;
  teacher_id: number;
  title: string;
  longitude: number;
  latitude: number;
  radius: number;
  start_time: string;
  end_time: string;
  qr_refresh_interval?: number;
  created_at: string;
}

/**
 * @description 创建考勤活动参数
 */
export interface CreateActivityData {
  title: string;
  longitude: number;
  latitude: number;
  radius: number;
  start_time: string;
  end_time: string;
  qr_refresh_interval?: number;
}

/**
 * @description 打卡记录接口
 */
export interface Record {
  id: number;
  user_id: number;
  activity_id: number;
  check_time: string;
  gps_longitude: number;
  gps_latitude: number;
  liveness_result?: string;
  device_info?: string;
  status?: string;
  final_status?: string;
  title?: string;
  created_at: string;
}

/**
 * @description 学生打卡请求参数
 */
export interface CheckinData {
  activity_id: number;
  check_time: string;
  gps_longitude: number;
  gps_latitude: number;
  liveness_result?: string;
  device_info?: string;
}

/**
 * @description 申诉/请假记录接口
 */
export interface Appeal {
  id: number;
  user_id: number;
  activity_id: number;
  type: "appeal" | "leave";
  reason: string;
  status: "pending" | "approved" | "rejected";
  admin_comment: string | null;
  created_at: string;
  updated_at: string;
  title?: string;
  student_id?: string;
  name?: string;
}

/**
 * @description 提交申诉/请假参数
 */
export interface CreateAppealData {
  activity_id: number;
  type: "appeal" | "leave";
  reason: string;
}

// ==================== 考勤活动 ====================

export const createActivity = (data: CreateActivityData): Promise<Activity> => {
  return request.post<Activity>("/activities", data);
};

export const getTeacherActivities = (): Promise<Activity[]> => {
  return request.get<Activity[]>("/activities/teacher");
};

export const getActivityById = (id: number): Promise<Activity> => {
  return request.get<Activity>(`/activities/${id}`);
};

export const updateActivity = (
  id: number,
  data: Partial<CreateActivityData>,
): Promise<{ message: string }> => {
  return request.put(`/activities/${id}`, data);
};

export const deleteActivity = (id: number): Promise<{ message: string }> => {
  return request.delete(`/activities/${id}`);
};

export const getCurrentActivities = (): Promise<Activity[]> => {
  return request.get<Activity[]>("/activities/active/current");
};

// ==================== 打卡记录 ====================

export const createRecord = (data: CheckinData): Promise<Record> => {
  return request.post<Record>("/records", data);
};

export const getStudentRecords = (): Promise<Record[]> => {
  return request.get<Record[]>("/records/student");
};

export const getActivityRecords = (activityId: number): Promise<Record[]> => {
  return request.get<Record[]>(`/records/activity/${activityId}`);
};

export const getAttendanceRecords = (
  params: AttendanceQueryParams,
): Promise<{
  records: AttendanceRecord[];
  total: number;
  page: number;
  pageSize: number;
}> => {
  return request.get("/records", params);
};

export const modifyAttendanceStatus = (
  req: AttendanceModificationRequest,
): Promise<void> => {
  return request.post("/records/modify", req);
};

export const exportAttendanceData = (
  params: AttendanceQueryParams,
  options: ExportOptions,
): Promise<{ url: string }> => {
  return request.post("/records/export", { ...params, ...options });
};

// ==================== 申诉/请假 ====================

export const submitAppeal = (
  data: CreateAppealData,
): Promise<{ message: string }> => {
  return request.post("/appeals", data);
};

export const getStudentAppeals = (): Promise<Appeal[]> => {
  return request.get<Appeal[]>("/appeals/student");
};

export const getPendingAppeals = (): Promise<Appeal[]> => {
  return request.get<Appeal[]>("/appeals/pending");
};

export const reviewAppeal = (
  id: number,
  data: { status: "approved" | "rejected"; admin_comment?: string },
): Promise<{ message: string }> => {
  return request.put(`/appeals/${id}`, data);
};

// ==================== 统计报表 ====================

export const getStudentAttendanceStats = (params?: {
  startDate?: string;
  endDate?: string;
  className?: string;
}): Promise<StudentAttendanceStats[]> => {
  return request.get("/statistics/students", params);
};

export const getClassAttendanceStats = (): Promise<ClassAttendanceStats[]> => {
  return request.get("/statistics/classes");
};

export const getDateTrendData = (): Promise<DateTrendData[]> => {
  return request.get("/statistics/trend");
};

export const getLateDurationStats = (): Promise<LateDurationStats[]> => {
  return request.get("/statistics/late-duration");
};

export const getDashboardData = (): Promise<DashboardData> => {
  return request.get("/statistics/dashboard");
};
