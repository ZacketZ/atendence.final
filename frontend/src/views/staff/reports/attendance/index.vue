<template>
  <div class="attendance-report">
    <div class="page-header">
      <h2>考勤报告</h2>
      <p>查看您创建的所有考勤活动的统计数据</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="5" animated />
    </div>

    <template v-else>
      <!-- 概览统计卡片 -->
      <el-row :gutter="20" class="summary-cards">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="summary-item">
              <div class="summary-value">
                {{ reportData.summary.totalActivities }}
              </div>
              <div class="summary-label">总活动数</div>
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

      <!-- 签到率卡片 -->
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

      <!-- 活动考勤明细 -->
      <div class="section-title">活动考勤明细</div>
      <el-card v-if="reportData.activities.length === 0" class="empty-card">
        <el-empty description="暂无考勤活动数据" />
      </el-card>
      <el-table
        v-else
        :data="reportData.activities"
        stripe
        style="width: 100%"
        class="data-table"
      >
        <el-table-column prop="title" label="活动名称" min-width="160" />
        <el-table-column prop="date" label="日期" width="120" />
        <el-table-column
          prop="checkedIn"
          label="已签到"
          width="90"
          align="center"
        />
        <el-table-column prop="normal" label="正常" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="success">{{ row.normal }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="abnormal" label="异常" width="80" align="center">
          <template #default="{ row }">
            <el-tag size="small" type="danger">{{ row.abnormal }}</el-tag>
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
      </el-table>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import request from "@/utils/request";

interface ActivityReport {
  id: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  checkedIn: number;
  abnormal: number;
  normal: number;
  rate: string;
}

interface ReportData {
  summary: {
    totalActivities: number;
    totalRecords: number;
    normalCount: number;
    abnormalCount: number;
    attendanceRate: string;
  };
  activities: ActivityReport[];
}

const loading = ref(true);
const reportData = ref<ReportData>({
  summary: {
    totalActivities: 0,
    totalRecords: 0,
    normalCount: 0,
    abnormalCount: 0,
    attendanceRate: "0%",
  },
  activities: [],
});

// 签到率百分比（数字）
const ratePercent = computed(() => {
  const rate = reportData.value.summary.attendanceRate;
  return parseFloat(rate) || 0;
});

// 签到率颜色
const rateColor = computed(() => {
  const p = ratePercent.value;
  if (p >= 90) return "#67c23a";
  if (p >= 70) return "#e6a23c";
  return "#f56c6c";
});

// 单个活动的签到率颜色
function getRateColor(rate: number): string {
  if (rate >= 90) return "#67c23a";
  if (rate >= 70) return "#e6a23c";
  return "#f56c6c";
}

// 加载数据
async function loadData() {
  loading.value = true;
  try {
    const res: any = await request.get("/reports/attendance");
    if (res) {
      reportData.value = res;
    }
  } catch (error) {
    console.error("获取考勤报告失败:", error);
    ElMessage.error("获取考勤报告失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.attendance-report {
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
}
</style>
