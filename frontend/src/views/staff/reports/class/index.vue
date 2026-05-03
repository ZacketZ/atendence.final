<template>
  <div class="class-report">
    <div class="page-header">
      <h2>班级报告</h2>
      <p>按学生维度查看考勤数据汇总</p>
    </div>

    <!-- 筛选条件 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filters">
        <el-form-item label="开始日期">
          <el-date-picker
            v-model="filters.startDate"
            type="date"
            placeholder="选择开始日期"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item label="结束日期">
          <el-date-picker
            v-model="filters.endDate"
            type="date"
            placeholder="选择结束日期"
            value-format="YYYY-MM-DD"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="loadData" :loading="loading">
            查询
          </el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <!-- 概览统计 -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="summary-item">
              <div class="summary-value">
                {{ reportData.summary.totalStudents }}
              </div>
              <div class="summary-label">参与学生数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="summary-item">
              <div class="summary-value">
                {{ reportData.summary.totalRecords }}
              </div>
              <div class="summary-label">总打卡记录</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="summary-item">
              <div class="summary-value success">
                {{ reportData.summary.normalCount }}
              </div>
              <div class="summary-label">正常签到</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="summary-item">
              <div class="summary-value danger">
                {{ reportData.summary.abnormalCount }}
              </div>
              <div class="summary-label">异常签到</div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 签到率 -->
      <el-row :gutter="20" class="rate-row">
        <el-col :span="8">
          <el-card shadow="hover">
            <div class="rate-card">
              <div class="rate-title">总签到率</div>
              <div class="rate-value">
                {{ reportData.summary.attendanceRate }}
              </div>
              <el-progress
                :percentage="ratePercent"
                :stroke-width="12"
                :color="rateColor"
                striped
                striped-flow
              />
            </div>
          </el-card>
        </el-col>
      </el-row>

      <!-- 学生考勤明细 -->
      <div class="section-title">学生考勤明细</div>
      <el-card v-if="reportData.students.length === 0" class="empty-card">
        <el-empty description="暂无学生考勤数据" />
      </el-card>
      <el-table
        v-else
        :data="reportData.students"
        stripe
        style="width: 100%"
        class="data-table"
        @row-click="handleRowClick"
      >
        <el-table-column prop="studentId" label="学号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column
          prop="totalActivities"
          label="参与活动数"
          width="110"
          align="center"
        />
        <el-table-column
          prop="totalRecords"
          label="打卡次数"
          width="100"
          align="center"
        />
        <el-table-column
          prop="normalCount"
          label="正常"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.normalCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="abnormalCount"
          label="异常"
          width="80"
          align="center"
        >
          <template #default="{ row }">
            <el-tag size="small" type="danger">{{ row.abnormalCount }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rate" label="签到率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="parseFloat(row.rate)"
              :stroke-width="10"
              :color="getRateColor(parseFloat(row.rate))"
              style="width: 80px"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click.stop="viewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </template>

    <!-- 学生详情弹窗 -->
    <el-dialog
      v-model="detailDialog.visible"
      :title="`${detailDialog.studentName} - 考勤详情`"
      width="700px"
    >
      <template v-if="detailDialog.loading">
        <el-skeleton :rows="4" animated />
      </template>
      <template v-else>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="学号">{{
            detailDialog.studentId
          }}</el-descriptions-item>
          <el-descriptions-item label="姓名">{{
            detailDialog.studentName
          }}</el-descriptions-item>
          <el-descriptions-item label="参与活动数">{{
            detailDialog.totalActivities
          }}</el-descriptions-item>
          <el-descriptions-item label="签到率">{{
            detailDialog.rate
          }}</el-descriptions-item>
        </el-descriptions>
        <el-divider />
        <h4 style="margin-bottom: 12px">活动记录</h4>
        <el-table :data="detailDialog.records" stripe size="small">
          <el-table-column prop="title" label="活动名称" min-width="140" />
          <el-table-column prop="checkTime" label="签到时间" width="160" />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag
                :type="row.status === 'normal' ? 'success' : 'danger'"
                size="small"
              >
                {{ row.status === "normal" ? "正常" : "异常" }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";

interface StudentReport {
  id: number;
  studentId: string;
  name: string;
  totalActivities: number;
  totalRecords: number;
  normalCount: number;
  abnormalCount: number;
  rate: string;
}

interface ClassReportData {
  summary: {
    totalStudents: number;
    totalRecords: number;
    normalCount: number;
    abnormalCount: number;
    attendanceRate: string;
  };
  students: StudentReport[];
}

const loading = ref(false);
const filters = ref({
  startDate: "",
  endDate: "",
});

const reportData = ref<ClassReportData>({
  summary: {
    totalStudents: 0,
    totalRecords: 0,
    normalCount: 0,
    abnormalCount: 0,
    attendanceRate: "0%",
  },
  students: [],
});

// 签到率百分比
const ratePercent = computed(() => {
  return parseFloat(reportData.value.summary.attendanceRate) || 0;
});

// 签到率颜色
const rateColor = computed(() => {
  const p = ratePercent.value;
  if (p >= 90) return "#67c23a";
  if (p >= 70) return "#e6a23c";
  return "#f56c6c";
});

function getRateColor(rate: number): string {
  if (rate >= 90) return "#67c23a";
  if (rate >= 70) return "#e6a23c";
  return "#f56c6c";
}

// 学生详情弹窗
const detailDialog = ref({
  visible: false,
  loading: false,
  studentId: "",
  studentName: "",
  totalActivities: 0,
  rate: "0%",
  records: [] as any[],
});

// 查看学生详情
async function viewDetail(student: StudentReport) {
  detailDialog.value = {
    visible: true,
    loading: true,
    studentId: student.studentId,
    studentName: student.name,
    totalActivities: student.totalActivities,
    rate: student.rate,
    records: [],
  };

  try {
    // 获取该学生的详细考勤记录
    const params: any = { userId: student.id };
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const res: any = await request.get("/records", params);
    if (res?.records) {
      detailDialog.value.records = res.records.map((r: any) => ({
        title: r.title || "未知活动",
        checkTime: r.check_time
          ? r.check_time.substring(0, 19).replace("T", " ")
          : "",
        status: r.final_status || r.status || "unknown",
      }));
    }
  } catch (error) {
    console.error("获取学生详情失败:", error);
    ElMessage.error("获取学生详情失败");
  } finally {
    detailDialog.value.loading = false;
  }
}

// 行点击
function handleRowClick(row: StudentReport) {
  viewDetail(row);
}

// 重置筛选
function resetFilters() {
  filters.value = {
    startDate: "",
    endDate: "",
  };
  loadData();
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const params: any = {};
    if (filters.value.startDate) params.startDate = filters.value.startDate;
    if (filters.value.endDate) params.endDate = filters.value.endDate;

    const res: any = await request.get("/reports/class", { params });
    if (res) {
      reportData.value = res;
    }
  } catch (error) {
    console.error("获取班级报告失败:", error);
    ElMessage.error("获取班级报告失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.class-report {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: calc(100vh - 60px);
}

.page-header {
  margin-bottom: 24px;

  h2 {
    margin: 0 0 8px 0;
    color: #303133;
    font-size: 24px;
  }

  p {
    margin: 0;
    color: #909399;
    font-size: 14px;
  }
}

.filter-card {
  margin-bottom: 20px;
}

.loading-state {
  padding: 40px 20px;
  background: #fff;
  border-radius: 8px;
}

.summary-cards {
  margin-bottom: 20px;

  .summary-item {
    text-align: center;
    padding: 12px 0;

    .summary-value {
      font-size: 32px;
      font-weight: bold;
      color: #409eff;
      margin-bottom: 8px;

      &.success {
        color: #67c23a;
      }

      &.danger {
        color: #f56c6c;
      }
    }

    .summary-label {
      color: #606266;
      font-size: 14px;
    }
  }
}

.rate-row {
  margin-bottom: 24px;

  .rate-card {
    text-align: center;
    padding: 8px 0;

    .rate-title {
      font-size: 14px;
      color: #606266;
      margin-bottom: 12px;
    }

    .rate-value {
      font-size: 36px;
      font-weight: bold;
      color: #303133;
      margin-bottom: 16px;
    }
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 16px;
  padding-left: 12px;
  border-left: 3px solid #409eff;
}

.empty-card {
  margin-bottom: 20px;
}

.data-table {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}
</style>
