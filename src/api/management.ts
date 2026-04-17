import {
  OperationLog,
  PasswordResetRequest,
  ApiResponse,
  ExcelImportTemplate,
} from "@/types/management";

// 模拟操作日志数据
const mockOperationLogs: OperationLog[] = [
  {
    id: 1,
    operatorId: "admin",
    operatorName: "系统管理员",
    operationType: "create",
    targetType: "faculty",
    targetId: "T001",
    targetName: "张老师",
    details: "创建新教职工",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-03-20 10:30:25",
  },
  {
    id: 2,
    operatorId: "admin",
    operatorName: "系统管理员",
    operationType: "update",
    targetType: "student",
    targetId: "20230001",
    targetName: "张三",
    details: "更新学生信息",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-03-20 11:15:42",
  },
  {
    id: 3,
    operatorId: "department_admin",
    operatorName: "赵管理员",
    operationType: "import",
    targetType: "student",
    targetId: "batch",
    targetName: "批量导入",
    details: "导入学生数据，成功13条，失败2条",
    ipAddress: "192.168.1.101",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    createdAt: "2024-03-19 14:20:33",
  },
  {
    id: 4,
    operatorId: "counselor",
    operatorName: "王辅导员",
    operationType: "password_reset",
    targetType: "student",
    targetId: "20230002",
    targetName: "李四",
    details: "重置学生密码",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-03-19 09:45:18",
  },
  {
    id: 5,
    operatorId: "admin",
    operatorName: "系统管理员",
    operationType: "status_change",
    targetType: "faculty",
    targetId: "T004",
    targetName: "吴老师",
    details: "更改状态为离职，禁用账号",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-03-18 16:30:55",
  },
  {
    id: 6,
    operatorId: "department_admin",
    operatorName: "赵管理员",
    operationType: "permission_change",
    targetType: "faculty",
    targetId: "T002",
    targetName: "李老师",
    details: "修改考勤权限为可修改所带班级",
    ipAddress: "192.168.1.101",
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    createdAt: "2024-03-18 10:15:27",
  },
  {
    id: 7,
    operatorId: "admin",
    operatorName: "系统管理员",
    operationType: "delete",
    targetType: "student",
    targetId: "20230004",
    targetName: "周九",
    details: "删除退学学生",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-03-17 15:40:12",
  },
  {
    id: 8,
    operatorId: "counselor",
    operatorName: "王辅导员",
    operationType: "update",
    targetType: "student",
    targetId: "20230005",
    targetName: "吴十",
    details: "更新联系方式",
    ipAddress: "192.168.1.102",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    createdAt: "2024-03-17 11:25:39",
  },
];

// 获取操作日志
export const getOperationLogs = async (
  params: {
    operatorId?: string;
    targetType?: "faculty" | "student" | "user";
    operationType?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  } = {},
): Promise<{
  data: OperationLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let filtered = [...mockOperationLogs];

      // 应用筛选条件
      if (params.operatorId) {
        filtered = filtered.filter((log) =>
          log.operatorId
            .toLowerCase()
            .includes(params.operatorId!.toLowerCase()),
        );
      }
      if (params.targetType) {
        filtered = filtered.filter(
          (log) => log.targetType === params.targetType,
        );
      }
      if (params.operationType) {
        filtered = filtered.filter(
          (log) => log.operationType === params.operationType,
        );
      }
      if (params.startDate) {
        filtered = filtered.filter((log) => log.createdAt >= params.startDate!);
      }
      if (params.endDate) {
        filtered = filtered.filter((log) => log.createdAt <= params.endDate!);
      }

      // 按时间倒序排序
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      // 分页
      const page = params.page || 1;
      const pageSize = params.pageSize || 10;
      const start = (page - 1) * pageSize;
      const end = start + pageSize;
      const paginatedData = filtered.slice(start, end);

      resolve({
        data: paginatedData,
        total: filtered.length,
        page,
        pageSize,
        totalPages: Math.ceil(filtered.length / pageSize),
      });
    }, 500);
  });
};

// 密码重置
export const resetPassword = async (
  request: PasswordResetRequest,
): Promise<ApiResponse<void>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`重置密码请求:`, request);

      // 模拟密码重置逻辑
      const newPassword = request.newPassword || generateRandomPassword();

      if (request.sendEmail) {
        console.log(`发送密码重置邮件到 ${request.userId}`);
      }

      resolve({
        code: 200,
        message: "密码重置成功",
        data: undefined,
        timestamp: new Date().toISOString(),
      });
    }, 500);
  });
};

// 生成随机密码
const generateRandomPassword = (): string => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// 获取Excel导入模板
export const getImportTemplate = async (): Promise<ExcelImportTemplate> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        faculty: {
          headers: [
            "工号",
            "姓名",
            "部门",
            "职位",
            "联系方式",
            "邮箱",
            "角色",
            "考勤权限",
            "状态",
          ],
          sampleData: [
            {
              工号: "T001",
              姓名: "张老师",
              部门: "计算机学院",
              职位: "教授",
              联系方式: "13800138001",
              邮箱: "zhang@example.com",
              角色: "teacher",
              考勤权限: "view_own_class",
              状态: "active",
            },
          ],
        },
        student: {
          headers: [
            "学号",
            "姓名",
            "班级",
            "专业",
            "入学年份",
            "联系方式",
            "邮箱",
            "状态",
          ],
          sampleData: [
            {
              学号: "20230001",
              姓名: "张三",
              班级: "计算机科学与技术1班",
              专业: "计算机科学与技术",
              入学年份: "2023",
              联系方式: "13800138009",
              邮箱: "zhangsan@example.com",
              状态: "enrolled",
            },
          ],
        },
      });
    }, 300);
  });
};

// 下载导入模板
export const downloadImportTemplate = async (
  type: "faculty" | "student",
): Promise<Blob> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const template =
        type === "faculty"
          ? "工号,姓名,部门,职位,联系方式,邮箱,角色,考勤权限,状态\nT001,张老师,计算机学院,教授,13800138001,zhang@example.com,teacher,view_own_class,active"
          : "学号,姓名,班级,专业,入学年份,联系方式,邮箱,状态\n20230001,张三,计算机科学与技术1班,计算机科学与技术,2023,13800138009,zhangsan@example.com,enrolled";

      const blob = new Blob([template], { type: "text/csv" });
      resolve(blob);
    }, 300);
  });
};

// 记录操作日志（供其他模块调用）
export const logOperation = async (
  operation: Omit<OperationLog, "id" | "createdAt">,
): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const newLog: OperationLog = {
        ...operation,
        id: mockOperationLogs.length + 1,
        createdAt: new Date().toISOString().replace("T", " ").substring(0, 19),
      };
      mockOperationLogs.unshift(newLog);
      console.log("记录操作日志:", newLog);
      resolve();
    }, 100);
  });
};

// 获取系统统计信息
export const getSystemStats = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        faculty: {
          total: 8,
          active: 6,
          leave: 1,
          external: 1,
          resigned: 1,
        },
        student: {
          total: 8,
          enrolled: 5,
          suspended: 1,
          graduated: 1,
          withdrawn: 1,
        },
        recentOperations: 8,
        todayOperations: 2,
      });
    }, 400);
  });
};
