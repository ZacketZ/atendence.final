<template>
  <div class="operation-logs">
    <div class="header">
      <h1>操作日志</h1>
      <div class="header-actions">
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon> 导出日志
        </el-button>
        <el-button @click="handleRefresh">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="操作人">
              <el-input
                v-model="searchForm.operatorId"
                placeholder="请输入操作人ID或姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="操作类型">
              <el-select
                v-model="searchForm.operationType"
                placeholder="请选择操作类型"
                clearable
              >
                <el-option label="创建" value="create" />
                <el-option label="更新" value="update" />
                <el-option label="删除" value="delete" />
                <el-option label="导入" value="import" />
                <el-option label="导出" value="export" />
                <el-option label="密码重置" value="password_reset" />
                <el-option label="状态变更" value="status_change" />
                <el-option label="权限变更" value="permission_change" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标类型">
              <el-select
                v-model="searchForm.targetType"
                placeholder="请选择目标类型"
                clearable
              >
                <el-option label="教职工" value="faculty" />
                <el-option label="学生" value="student" />
                <el-option label="用户" value="user" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="目标ID">
              <el-input
                v-model="searchForm.targetId"
                placeholder="请输入目标ID"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="开始时间">
              <el-date-picker
                v-model="searchForm.startDate"
                type="datetime"
                placeholder="选择开始时间"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="结束时间">
              <el-date-picker
                v-model="searchForm.endDate"
                type="datetime"
                placeholder="选择结束时间"
                value-format="YYYY-MM-DD HH:mm:ss"
              />
            </el-form-item>
          </el-col>
          <el-col :span="8" class="search-actions">
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon> 搜索
            </el-button>
            <el-button @click="handleReset">
              <el-icon><Refresh /></el-icon> 重置
            </el-button>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card class="table-card">
      <el-table
        :data="logList"
        v-loading="loading"
        style="width: 100%"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable />
        <el-table-column prop="operatorId" label="操作人ID" width="120" />
        <el-table-column prop="operatorName" label="操作人姓名" width="120" />
        <el-table-column prop="operationType" label="操作类型" width="120">
          <template #default="{ row }">
            <el-tag :type="getOperationTypeTagType(row.operationType)">
              {{ getOperationTypeLabel(row.operationType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetType" label="目标类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTargetTypeTagType(row.targetType)">
              {{ getTargetTypeLabel(row.targetType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="目标ID" width="120" />
        <el-table-column prop="targetName" label="目标名称" width="150" />
        <el-table-column prop="details" label="操作详情" min-width="200" />
        <el-table-column prop="ipAddress" label="IP地址" width="120" />
        <el-table-column prop="createdAt" label="操作时间" width="160" sortable>
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleViewDetails(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 日志详情对话框 -->
    <el-dialog v-model="detailDialogVisible" title="操作日志详情" width="600px">
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="1" border>
          <el-descriptions-item label="日志ID">
            {{ currentLog.id }}
          </el-descriptions-item>
          <el-descriptions-item label="操作人">
            {{ currentLog.operatorName }} ({{ currentLog.operatorId }})
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag :type="getOperationTypeTagType(currentLog.operationType)">
              {{ getOperationTypeLabel(currentLog.operationType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标类型">
            <el-tag :type="getTargetTypeTagType(currentLog.targetType)">
              {{ getTargetTypeLabel(currentLog.targetType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="目标信息">
            {{ currentLog.targetName }} ({{ currentLog.targetId }})
          </el-descriptions-item>
          <el-descriptions-item label="操作详情">
            {{ currentLog.details }}
          </el-descriptions-item>
          <el-descriptions-item label="IP地址">
            {{ currentLog.ipAddress || "未知" }}
          </el-descriptions-item>
          <el-descriptions-item label="用户代理">
            <div class="user-agent">
              {{ currentLog.userAgent || "未知" }}
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="操作时间">
            {{ formatDateTime(currentLog.createdAt) }}
          </el-descriptions-item>
        </el-descriptions>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Download, Refresh, Search } from "@element-plus/icons-vue";
import { getOperationLogs } from "@/api/management";
import type { OperationLog } from "@/types/management";

// 数据
const loading = ref(false);
const logList = ref<OperationLog[]>([]);
const detailDialogVisible = ref(false);
const currentLog = ref<OperationLog | null>(null);

// 搜索表单
const searchForm = reactive({
  operatorId: "",
  operationType: "",
  targetType: "" as "faculty" | "student" | "user" | "",
  targetId: "",
  startDate: "",
  endDate: "",
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
});

// 排序
const sortParams = reactive({
  sortField: "createdAt",
  sortOrder: "descending",
});

// 方法
const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      operatorId: searchForm.operatorId || undefined,
      operationType: searchForm.operationType || undefined,
      targetType: searchForm.targetType || undefined,
      targetId: searchForm.targetId || undefined,
      startDate: searchForm.startDate || undefined,
      endDate: searchForm.endDate || undefined,
      page: pagination.page,
      pageSize: pagination.pageSize,
    };

    const response = await getOperationLogs(params);
    logList.value = response.data;
    pagination.total = response.total;
  } catch (error) {
    console.error("获取操作日志失败:", error);
    ElMessage.error("获取操作日志失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.page = 1;
  fetchLogs();
};

const handleReset = () => {
  Object.assign(searchForm, {
    operatorId: "",
    operationType: "",
    targetType: "",
    targetId: "",
    startDate: "",
    endDate: "",
  });
  pagination.page = 1;
  fetchLogs();
};

const handleRefresh = () => {
  fetchLogs();
};

const handleExport = async () => {
  try {
    // 模拟导出
    const logs = logList.value.map((log) => ({
      时间: log.createdAt,
      操作人: `${log.operatorName} (${log.operatorId})`,
      操作类型: getOperationTypeLabel(log.operationType),
      目标类型: getTargetTypeLabel(log.targetType),
      目标: `${log.targetName} (${log.targetId})`,
      操作详情: log.details,
      IP地址: log.ipAddress || "未知",
    }));

    const csvContent = [
      Object.keys(logs[0] || {}).join(","),
      ...logs.map((log) => Object.values(log).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `操作日志_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    ElMessage.success("导出成功");
  } catch (error) {
    console.error("导出失败:", error);
    ElMessage.error("导出失败");
  }
};

const handleViewDetails = (log: OperationLog) => {
  currentLog.value = log;
  detailDialogVisible.value = true;
};

const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  sortParams.sortField = prop;
  sortParams.sortOrder = order;
  // 这里可以添加排序逻辑
  fetchLogs();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchLogs();
};

const handleCurrentChange = (page: number) => {
  pagination.page = page;
  fetchLogs();
};

// 辅助函数
const getOperationTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    create: "创建",
    update: "更新",
    delete: "删除",
    import: "导入",
    export: "导出",
    password_reset: "密码重置",
    status_change: "状态变更",
    permission_change: "权限变更",
  };
  return map[type] || type;
};

const getOperationTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    create: "success",
    update: "primary",
    delete: "danger",
    import: "warning",
    export: "info",
    password_reset: "warning",
    status_change: "info",
    permission_change: "primary",
  };
  return map[type] || "";
};

const getTargetTypeLabel = (type: string) => {
  const map: Record<string, string> = {
    faculty: "教职工",
    student: "学生",
    user: "用户",
  };
  return map[type] || type;
};

const getTargetTypeTagType = (type: string) => {
  const map: Record<string, string> = {
    faculty: "primary",
    student: "success",
    user: "info",
  };
  return map[type] || "";
};

const formatDateTime = (dateTime: string) => {
  return dateTime.replace(" ", " ");
};

// 生命周期
onMounted(() => {
  fetchLogs();
});
</script>

<style scoped>
.operation-logs {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.search-card {
  margin-bottom: 20px;
}

.search-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 32px;
}

.table-card {
  margin-bottom: 20px;
}

.pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.log-detail {
  padding: 10px 0;
}

.user-agent {
  word-break: break-all;
  font-size: 12px;
  color: #666;
}
</style>
