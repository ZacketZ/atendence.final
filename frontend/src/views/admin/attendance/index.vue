<template>
  <div class="attendance-management">
    <!-- 页面标题和操作栏 -->
    <div class="page-header">
      <h2>考勤管理</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportData">
          <el-icon><Download /></el-icon>
          导出数据
        </el-button>
      </div>
    </div>

    <!-- 筛选条件 -->
    <div class="filter-section">
      <el-form :model="queryParams" inline>
        <el-form-item label="日期范围">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
          />
        </el-form-item>

        <el-form-item label="班级">
          <el-input
            v-model="queryParams.className"
            placeholder="请输入班级名称"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="学生姓名">
          <el-input
            v-model="queryParams.studentName"
            placeholder="请输入学生姓名"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="学号">
          <el-input
            v-model="queryParams.studentId"
            placeholder="请输入学号"
            clearable
            @clear="handleSearch"
            @keyup.enter="handleSearch"
          />
        </el-form-item>

        <el-form-item label="考勤状态">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
            @change="handleSearch"
          >
            <el-option label="全部" value="all" />
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="缺勤" value="absent" />
            <el-option label="请假" value="leave" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="resetSearch">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 快捷筛选 -->
      <div class="quick-filter">
        <el-space>
          <el-tag
            v-for="filter in quickFilters"
            :key="filter.value"
            :type="activeQuickFilter === filter.value ? 'primary' : 'info'"
            class="filter-tag"
            @click="handleQuickFilter(filter.value)"
          >
            {{ filter.label }}
          </el-tag>
        </el-space>
      </div>
    </div>

    <!-- 考勤记录表格 -->
    <div class="table-section">
      <el-table
        :data="attendanceRecords"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
      >
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="studentName" label="学生姓名" width="120" />
        <el-table-column prop="className" label="班级" width="180" />
        <el-table-column prop="courseName" label="课程" width="150" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column prop="checkinTime" label="签到时间" width="140">
          <template #default="{ row }">
            <span v-if="row.checkinTime">{{ row.checkinTime }}</span>
            <span v-else class="no-data">未签到</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="考勤状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="getStatusTagType(row.status)"
              size="small"
              :class="{ 'highlight-abnormal': isAbnormalStatus(row.status) }"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地点" width="150" />
        <el-table-column prop="teacher" label="教师" width="120" />
        <el-table-column prop="remark" label="备注" />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="isAbnormalStatus(row.status)"
              type="text"
              size="small"
              @click="handleModifyStatus(row)"
            >
              修改状态
            </el-button>
            <span v-else class="no-action">-</span>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination">
        <el-pagination
          v-model:current-page="queryParams.page"
          v-model:page-size="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 修改状态对话框 -->
    <el-dialog
      v-model="modifyDialogVisible"
      title="修改考勤状态"
      width="500px"
      @close="handleDialogClose"
    >
      <el-form :model="modifyForm" label-width="100px">
        <el-form-item label="当前状态">
          <el-tag :type="getStatusTagType(currentRecord?.status || '')">
            {{ getStatusText(currentRecord?.status || "") }}
          </el-tag>
        </el-form-item>

        <el-form-item label="新状态" required>
          <el-select v-model="modifyForm.newStatus" placeholder="请选择新状态">
            <el-option label="正常" value="normal" />
            <el-option label="迟到" value="late" />
            <el-option label="缺勤" value="absent" />
            <el-option label="请假" value="leave" />
          </el-select>
        </el-form-item>

        <el-form-item label="修改原因" required>
          <el-input
            v-model="modifyForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入修改原因"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="modifyDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            @click="submitModification"
            :loading="modifyLoading"
          >
            确认修改
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Search, Refresh, Download } from "@element-plus/icons-vue";
import type {
  AttendanceRecord,
  AttendanceQueryParams,
  AttendanceModificationRequest,
} from "@/types/attendance";
import {
  getAttendanceRecords,
  modifyAttendanceStatus,
  exportAttendanceData,
} from "@/api/attendance";

// 响应式数据
const loading = ref(false);
const modifyLoading = ref(false);
const modifyDialogVisible = ref(false);
const dateRange = ref<string[]>([]);
const total = ref(0);

// 当前选中的记录
const currentRecord = ref<AttendanceRecord | null>(null);

// 查询参数
const queryParams = reactive<AttendanceQueryParams>({
  page: 1,
  pageSize: 10,
  status: "all",
});

// 修改表单
const modifyForm = reactive<AttendanceModificationRequest>({
  recordId: 0,
  newStatus: "normal",
  reason: "",
});

// 考勤记录列表
const attendanceRecords = ref<AttendanceRecord[]>([]);

// 快捷筛选选项
const quickFilters = [
  { label: "仅看异常", value: "abnormal" },
  { label: "仅看迟到", value: "late" },
  { label: "仅看缺勤", value: "absent" },
];

const activeQuickFilter = ref<string>("");

// 状态标签类型映射
const getStatusTagType = (status: string) => {
  const map: Record<string, string> = {
    normal: "success",
    late: "warning",
    absent: "danger",
    leave: "info",
  };
  return map[status] || "info";
};

// 状态文本映射
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    normal: "正常",
    late: "迟到",
    absent: "缺勤",
    leave: "请假",
  };
  return map[status] || status;
};

// 判断是否为异常状态
const isAbnormalStatus = (status: string) => {
  return ["late", "absent", "leave"].includes(status);
};

// 处理日期范围变化
const handleDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    queryParams.startDate = dates[0];
    queryParams.endDate = dates[1];
  } else {
    queryParams.startDate = undefined;
    queryParams.endDate = undefined;
  }
  handleSearch();
};

// 处理查询
const handleSearch = () => {
  queryParams.page = 1;
  fetchAttendanceRecords();
};

// 重置查询
const resetSearch = () => {
  dateRange.value = [];
  Object.assign(queryParams, {
    page: 1,
    pageSize: 10,
    startDate: undefined,
    endDate: undefined,
    className: undefined,
    studentName: undefined,
    studentId: undefined,
    status: "all",
  });
  activeQuickFilter.value = "";
  fetchAttendanceRecords();
};

// 处理快捷筛选
const handleQuickFilter = (filter: string) => {
  if (activeQuickFilter.value === filter) {
    activeQuickFilter.value = "";
    queryParams.status = "all";
  } else {
    activeQuickFilter.value = filter;
    queryParams.status = filter as
      | "normal"
      | "late"
      | "absent"
      | "leave"
      | "all"
      | "abnormal";
  }
  handleSearch();
};

// 处理分页大小变化
const handleSizeChange = (size: number) => {
  queryParams.pageSize = size;
  fetchAttendanceRecords();
};

// 处理页码变化
const handleCurrentChange = (page: number) => {
  queryParams.page = page;
  fetchAttendanceRecords();
};

// 获取考勤记录
const fetchAttendanceRecords = async () => {
  try {
    loading.value = true;
    const response = await getAttendanceRecords(queryParams);
    attendanceRecords.value = response.records;
    total.value = response.total;
  } catch (error) {
    console.error("获取考勤记录失败:", error);
    ElMessage.error("获取考勤记录失败");
  } finally {
    loading.value = false;
  }
};

// 处理修改状态
const handleModifyStatus = (record: AttendanceRecord) => {
  currentRecord.value = record;
  modifyForm.recordId = record.id;
  modifyForm.newStatus = record.status;
  modifyForm.reason = "";
  modifyDialogVisible.value = true;
};

// 提交修改
const submitModification = async () => {
  if (!modifyForm.reason.trim()) {
    ElMessage.warning("请输入修改原因");
    return;
  }

  try {
    modifyLoading.value = true;
    await modifyAttendanceStatus(modifyForm);
    ElMessage.success("修改成功");
    modifyDialogVisible.value = false;
    fetchAttendanceRecords(); // 刷新数据
  } catch (error) {
    console.error("修改考勤状态失败:", error);
    ElMessage.error("修改失败");
  } finally {
    modifyLoading.value = false;
  }
};

// 处理对话框关闭
const handleDialogClose = () => {
  currentRecord.value = null;
  modifyForm.recordId = 0;
  modifyForm.newStatus = "normal";
  modifyForm.reason = "";
};

// 导出数据
const exportData = async () => {
  try {
    await ElMessageBox.confirm(
      "确认导出当前筛选条件下的考勤数据吗？",
      "导出确认",
      {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning",
      },
    );

    const response = await exportAttendanceData(queryParams, {
      format: "excel",
      includeFields: [
        "studentId",
        "studentName",
        "className",
        "courseName",
        "date",
        "checkinTime",
        "status",
        "location",
        "teacher",
        "remark",
      ],
      fileName: `考勤记录_${new Date().toISOString().split("T")[0]}`,
    });

    ElMessage.success("导出成功，文件已开始下载");
    // 在实际项目中，这里会触发文件下载
    console.log("导出文件URL:", response.url);
  } catch (error) {
    if (error !== "cancel") {
      console.error("导出失败:", error);
      ElMessage.error("导出失败");
    }
  }
};

// 初始化加载
onMounted(() => {
  fetchAttendanceRecords();
});
</script>

<style scoped lang="scss">
.attendance-management {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    color: #303133;
    font-size: 24px;
  }
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .el-form {
    margin-bottom: 15px;
  }
}

.quick-filter {
  padding-top: 15px;
  border-top: 1px solid #ebeef5;

  .filter-tag {
    cursor: pointer;
    padding: 8px 16px;
    font-size: 14px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }
  }
}

.table-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

  .no-data {
    color: #909399;
    font-style: italic;
  }

  .no-action {
    color: #909399;
  }

  .highlight-abnormal {
    font-weight: bold;
    border-width: 2px;
  }
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

// 状态标签样式增强
:deep(.el-tag) {
  &.el-tag--warning {
    background-color: #fdf6ec;
    border-color: #f5dab1;
    color: #e6a23c;
  }

  &.el-tag--danger {
    background-color: #fef0f0;
    border-color: #fbc4c4;
    color: #f56c6c;
  }

  &.el-tag--success {
    background-color: #f0f9eb;
    border-color: #c2e7b0;
    color: #67c23a;
  }

  &.el-tag--info {
    background-color: #f4f4f5;
    border-color: #d3d4d6;
    color: #909399;
  }
}
</style>
