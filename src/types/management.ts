// 教职工管理相关类型定义
export interface Faculty {
  id: number;
  employeeId: string; // 工号
  name: string; // 姓名
  department: string; // 部门
  position: string; // 职位
  phone: string; // 联系方式
  email: string;
  role: FacultyRole; // 角色
  attendancePermission: AttendancePermission; // 考勤权限
  status: FacultyStatus; // 状态
  accountEnabled: boolean; // 账号是否启用
  createdAt: string;
  updatedAt: string;
}

export type FacultyRole =
  | "teacher"
  | "counselor"
  | "department_admin"
  | "system_admin";
export type FacultyStatus = "active" | "leave" | "external" | "resigned";
export type AttendancePermission =
  | "none"
  | "view_own_class"
  | "view_all_classes"
  | "modify_own_class"
  | "modify_all_classes";

// 学生管理相关类型定义
export interface Student {
  id: number;
  studentId: string; // 学号
  name: string; // 姓名
  class: string; // 班级
  major: string; // 专业
  enrollmentYear: number; // 入学年份
  phone: string;
  email: string;
  status: StudentStatus; // 状态
  accountEnabled: boolean; // 账号是否启用
  facultyAdvisor?: string; // 辅导员
  college?: string; // 学院
  grade?: string; // 年级
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus =
  | "enrolled"
  | "suspended"
  | "graduated"
  | "withdrawn";

// 批量导入相关类型
export interface BatchImportResult {
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

export interface ExcelImportTemplate {
  faculty: {
    headers: string[];
    sampleData: Record<string, any>[];
  };
  student: {
    headers: string[];
    sampleData: Record<string, any>[];
  };
}

// 搜索参数类型
export interface FacultySearchParams {
  employeeId?: string;
  name?: string;
  department?: string;
  position?: string;
  role?: FacultyRole;
  status?: FacultyStatus;
  page?: number;
  pageSize?: number;
}

export interface StudentSearchParams {
  studentId?: string;
  name?: string;
  class?: string;
  major?: string;
  enrollmentYear?: number;
  status?: StudentStatus;
  page?: number;
  pageSize?: number;
}

// 操作日志类型
export interface OperationLog {
  id: number;
  operatorId: string;
  operatorName: string;
  operationType: OperationType;
  targetType: "faculty" | "student" | "user";
  targetId: string;
  targetName: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export type OperationType =
  | "create"
  | "update"
  | "delete"
  | "import"
  | "export"
  | "password_reset"
  | "status_change"
  | "permission_change";

// 密码重置请求类型
export interface PasswordResetRequest {
  userId: string;
  userType: "faculty" | "student";
  newPassword?: string;
  sendEmail?: boolean;
}

// 角色权限配置
export interface RolePermission {
  role: FacultyRole;
  permissions: {
    attendance: {
      view: "none" | "own_class" | "all_classes";
      modify: "none" | "own_class" | "all_classes";
    };
    management: {
      faculty: boolean;
      student: boolean;
      schedule: boolean;
      attendance: boolean;
    };
  };
}

// API响应类型
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
  timestamp: string;
}
