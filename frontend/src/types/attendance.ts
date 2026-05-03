// 考勤记录类型
export interface AttendanceRecord {
  id: number;
  studentId: string;
  studentName: string;
  className: string;
  courseId: number;
  courseName: string;
  checkinTime: string;
  status: "normal" | "late" | "absent" | "leave";
  location?: string;
  teacher: string;
  date: string;
  remark?: string;
  modifiedBy?: string;
  modifiedAt?: string;
  modificationReason?: string;
}

// 考勤统计类型
export interface AttendanceStats {
  // 总体统计
  totalStudents: number;
  totalCourses: number;
  totalRecords: number;

  // 异常统计
  todayLateCount: number;
  todayAbsentCount: number;
  todayLeaveCount: number;

  // 本周统计
  weekLateCount: number;
  weekAbsentCount: number;
  weekLeaveCount: number;

  // 月度统计
  monthLateCount: number;
  monthAbsentCount: number;
  monthLeaveCount: number;
}

// 学生考勤统计
export interface StudentAttendanceStats {
  studentId: string;
  studentName: string;
  className: string;
  totalCourses: number;
  lateCount: number;
  absentCount: number;
  leaveCount: number;
  lateRate: number; // 迟到率
  absentRate: number; // 缺勤率
  totalAbnormalRate: number; // 总异常率
}

// 班级考勤统计
export interface ClassAttendanceStats {
  className: string;
  totalStudents: number;
  averageLateRate: number;
  averageAbsentRate: number;
  totalLateCount: number;
  totalAbsentCount: number;
  totalLeaveCount: number;
}

// 日期趋势数据
export interface DateTrendData {
  date: string;
  lateCount: number;
  absentCount: number;
  leaveCount: number;
  totalAbnormalCount: number;
}

// 迟到时长分布
export interface LateDurationStats {
  durationRange: string; // 如 "0-5分钟", "5-15分钟", "15分钟以上"
  count: number;
  percentage: number;
}

// 考勤查询参数
export interface AttendanceQueryParams {
  startDate?: string;
  endDate?: string;
  className?: string;
  studentName?: string;
  studentId?: string;
  status?: "normal" | "late" | "absent" | "leave" | "all" | "abnormal";
  page?: number;
  pageSize?: number;
}

// 考勤修改请求
export interface AttendanceModificationRequest {
  recordId: number;
  newStatus: "normal" | "late" | "absent" | "leave";
  reason: string;
}

// 导出格式
export interface ExportOptions {
  format: "excel" | "pdf";
  includeFields: string[];
  fileName?: string;
}

// 看板数据
export interface DashboardData {
  todayLateCount: number;
  todayAbsentCount: number;
  weekAbnormalCount: number;
  monthAbnormalCount: number;
  recentAbnormalRecords: AttendanceRecord[];
  topLateStudents: StudentAttendanceStats[];
  topAbsentStudents: StudentAttendanceStats[];
}
