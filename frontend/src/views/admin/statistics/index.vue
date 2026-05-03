<template>
  <div class="statistics">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2>统计报表</h2>
      <div class="header-actions">
        <el-button type="primary" @click="exportReport">
          <el-icon><Download /></el-icon>
          导出报表
        </el-button>
      </div>
    </div>

    <!-- 异常考勤汇总看板 -->
    <div class="dashboard-section">
      <h3 class="section-title">异常考勤汇总看板</h3>
      <div class="dashboard-cards">
        <el-card class="dashboard-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background-color: #fdf6ec">
              <el-icon color="#e6a23c"><Clock /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ dashboardData.todayLateCount }}</div>
              <div class="card-label">今日迟到人数</div>
            </div>
          </div>
        </el-card>

        <el-card class="dashboard-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background-color: #fef0f0">
              <el-icon color="#f56c6c"><CloseBold /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">{{ dashboardData.todayAbsentCount }}</div>
              <div class="card-label">今日缺勤人数</div>
            </div>
          </div>
        </el-card>

        <el-card class="dashboard-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background-color: #ecf5ff">
              <el-icon color="#409eff"><Calendar /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">
                {{ dashboardData.weekAbnormalCount }}
              </div>
              <div class="card-label">本周累计异常</div>
            </div>
          </div>
        </el-card>

        <el-card class="dashboard-card" shadow="hover">
          <div class="card-content">
            <div class="card-icon" style="background-color: #f0f9eb">
              <el-icon color="#67c23a"><DataAnalysis /></el-icon>
            </div>
            <div class="card-info">
              <div class="card-value">
                {{ dashboardData.monthAbnormalCount }}
              </div>
              <div class="card-label">本月累计异常</div>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 缺勤统计报表 -->
    <div class="report-section">
      <h3 class="section-title">缺勤统计报表</h3>

      <!-- 筛选条件 -->
      <div class="filter-section">
        <el-form :model="queryParams" inline>
          <el-form-item label="统计维度">
            <el-select
              v-model="queryParams.dimension"
              @change="handleDimensionChange"
            >
              <el-option label="按学生统计" value="student" />
              <el-option label="按班级统计" value="class" />
              <el-option label="按日期趋势" value="date" />
            </el-select>
          </el-form-item>

          <el-form-item
            label="日期范围"
            v-if="queryParams.dimension === 'date'"
          >
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

          <el-form-item label="班级" v-if="queryParams.dimension === 'student'">
            <el-select
              v-model="queryParams.className"
              placeholder="请选择班级"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="classItem in classList"
                :key="classItem"
                :label="classItem"
                :value="classItem"
              />
            </el-select>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 按学生统计 -->
      <div v-if="queryParams.dimension === 'student'" class="student-stats">
        <el-table
          :data="studentStats"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
          :default-sort="{ prop: 'totalAbnormalRate', order: 'descending' }"
        >
          <el-table-column prop="studentId" label="学号" width="120" />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="className" label="班级" width="150" />
          <el-table-column prop="totalCourses" label="总课程数" width="100" />
          <el-table-column prop="lateCount" label="迟到次数" width="100">
            <template #default="{ row }">
              <span :class="{ 'highlight-warning': row.lateCount > 0 }">{{
                row.lateCount
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="absentCount" label="缺勤次数" width="100">
            <template #default="{ row }">
              <span :class="{ 'highlight-danger': row.absentCount > 0 }">{{
                row.absentCount
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="leaveCount" label="请假次数" width="100" />
          <el-table-column prop="lateRate" label="迟到率" width="100">
            <template #default="{ row }">
              <span :class="{ 'highlight-warning': row.lateRate > 10 }"
                >{{ row.lateRate }}%</span
              >
            </template>
          </el-table-column>
          <el-table-column prop="absentRate" label="缺勤率" width="100">
            <template #default="{ row }">
              <span :class="{ 'highlight-danger': row.absentRate > 5 }"
                >{{ row.absentRate }}%</span
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="totalAbnormalRate"
            label="总异常率"
            width="120"
            sortable
          >
            <template #default="{ row }">
              <el-progress
                :percentage="row.totalAbnormalRate"
                :color="getProgressColor(row.totalAbnormalRate)"
                :show-text="false"
              />
              <span class="rate-text">{{ row.totalAbnormalRate }}%</span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 按班级统计 -->
      <div v-else-if="queryParams.dimension === 'class'" class="class-stats">
        <el-table
          :data="classStats"
          v-loading="loading"
          border
          stripe
          style="width: 100%"
          :default-sort="{ prop: 'averageAbsentRate', order: 'descending' }"
        >
          <el-table-column prop="className" label="班级" width="200" />
          <el-table-column prop="totalStudents" label="学生人数" width="100" />
          <el-table-column
            prop="averageLateRate"
            label="平均迟到率"
            width="120"
          >
            <template #default="{ row }">
              <span :class="{ 'highlight-warning': row.averageLateRate > 15 }"
                >{{ row.averageLateRate }}%</span
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="averageAbsentRate"
            label="平均缺勤率"
            width="120"
            sortable
          >
            <template #default="{ row }">
              <span :class="{ 'highlight-danger': row.averageAbsentRate > 10 }"
                >{{ row.averageAbsentRate }}%</span
              >
            </template>
          </el-table-column>
          <el-table-column
            prop="totalLateCount"
            label="迟到总人次"
            width="120"
          />
          <el-table-column
            prop="totalAbsentCount"
            label="缺勤总人次"
            width="120"
          />
          <el-table-column
            prop="totalLeaveCount"
            label="请假总人次"
            width="120"
          />
        </el-table>
      </div>

      <!-- 按日期趋势 -->
      <div v-else-if="queryParams.dimension === 'date'" class="date-trend">
        <div class="chart-container">
          <div ref="trendChart" style="width: 100%; height: 400px"></div>
        </div>
      </div>
    </div>

    <!-- 迟到统计报表 -->
    <div class="late-report-section">
      <h3 class="section-title">迟到统计报表</h3>

      <div class="late-stats-content">
        <!-- 迟到时长分布 -->
        <div class="duration-distribution">
          <h4>迟到时长分布</h4>
          <div class="distribution-chart">
            <div ref="durationChart" style="width: 100%; height: 300px"></div>
          </div>
        </div>

        <!-- 迟到明细 -->
        <div class="late-details">
          <h4>迟到明细</h4>
          <el-table
            :data="recentLateRecords"
            border
            stripe
            style="width: 100%"
            max-height="300"
          >
            <el-table-column prop="studentName" label="学生姓名" width="120" />
            <el-table-column prop="className" label="班级" width="150" />
            <el-table-column prop="courseName" label="课程" width="150" />
            <el-table-column prop="date" label="日期" width="120" />
            <el-table-column prop="checkinTime" label="签到时间" width="140" />
            <el-table-column prop="remark" label="备注">
              <template #default="{ row }">
                <span v-if="row.remark">{{ row.remark }}</span>
                <span v-else class="no-remark">-</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Download,
  Clock,
  CloseBold,
  Calendar,
  DataAnalysis,
} from "@element-plus/icons-vue";
import * as echarts from "echarts";
import type {
  StudentAttendanceStats,
  ClassAttendanceStats,
  DateTrendData,
  LateDurationStats,
  DashboardData,
  AttendanceRecord,
} from "@/types/attendance";
import {
  getStudentAttendanceStats,
  getClassAttendanceStats,
  getDateTrendData,
  getLateDurationStats,
  getDashboardData,
} from "@/api/attendance";

// 响应式数据
const loading = ref(false);
const dateRange = ref<string[]>([]);
const trendChart = ref<HTMLElement>();
const durationChart = ref<HTMLElement>();
let trendChartInstance: echarts.ECharts | null = null;
let durationChartInstance: echarts.ECharts | null = null;

// 查询参数
const queryParams = reactive({
  dimension: "student" as "student" | "class" | "date",
  startDate: "",
  endDate: "",
  className: "",
});

// 数据
const dashboardData = ref<DashboardData>({
  todayLateCount: 0,
  todayAbsentCount: 0,
  weekAbnormalCount: 0,
  monthAbnormalCount: 0,
  recentAbnormalRecords: [],
  topLateStudents: [],
  topAbsentStudents: [],
});

const studentStats = ref<StudentAttendanceStats[]>([]);
const classStats = ref<ClassAttendanceStats[]>([]);
const dateTrendData = ref<DateTrendData[]>([]);
const lateDurationStats = ref<LateDurationStats[]>([]);
const recentLateRecords = ref<AttendanceRecord[]>([]);
const classList = ref<string[]>([]);

// 获取进度条颜色
const getProgressColor = (percentage: number) => {
  if (percentage >= 50) return "#f56c6c";
  if (percentage >= 30) return "#e6a23c";
  if (percentage >= 10) return "#409eff";
  return "#67c23a";
};

// 处理维度变化
const handleDimensionChange = () => {
  handleSearch();
};

// 处理日期范围变化
const handleDateChange = (dates: string[]) => {
  if (dates && dates.length === 2) {
    queryParams.startDate = dates[0];
    queryParams.endDate = dates[1];
  } else {
    queryParams.startDate = "";
    queryParams.endDate = "";
  }
  if (queryParams.dimension === "date") {
    handleSearch();
  }
};

// 处理查询
const handleSearch = async () => {
  loading.value = true;

  try {
    switch (queryParams.dimension) {
      case "student":
        studentStats.value = await getStudentAttendanceStats({
          startDate: queryParams.startDate || undefined,
          endDate: queryParams.endDate || undefined,
          className: queryParams.className || undefined,
        });
        break;
      case "class":
        classStats.value = await getClassAttendanceStats();
        break;
      case "date":
        if (queryParams.startDate && queryParams.endDate) {
          dateTrendData.value = await getDateTrendData();
          renderTrendChart();
        }
        break;
    }
  } catch (error) {
    console.error("获取统计数据失败:", error);
    ElMessage.error("获取统计数据失败");
  } finally {
    loading.value = false;
  }
};

// 获取看板数据
const fetchDashboardData = async () => {
  try {
    dashboardData.value = await getDashboardData();
    recentLateRecords.value = dashboardData.value.recentAbnormalRecords;
  } catch (error) {
    console.error("获取看板数据失败:", error);
  }
};

// 获取迟到时长分布
const fetchLateDurationStats = async () => {
  try {
    lateDurationStats.value = await getLateDurationStats();
    renderDurationChart();
  } catch (error) {
    console.error("获取迟到时长分布失败:", error);
  }
};

// 获取班级列表
const fetchClassList = async () => {
  try {
    const classStats = await getClassAttendanceStats();
    classList.value = classStats.map((item) => item.className);
  } catch (error) {
    console.error("获取班级列表失败:", error);
  }
};

// 渲染趋势图表
const renderTrendChart = () => {
  if (!trendChart.value || dateTrendData.value.length === 0) return;

  nextTick(() => {
    if (trendChartInstance) {
      trendChartInstance.dispose();
    }

    trendChartInstance = echarts.init(trendChart.value!);

    const option = {
      title: {
        text: "异常考勤趋势图",
        left: "center",
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
        },
      },
      legend: {
        data: ["迟到人数", "缺勤人数", "请假人数", "总异常人数"],
        top: 30,
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        top: "80px",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: dateTrendData.value.map((item) => item.date),
      },
      yAxis: {
        type: "value",
        name: "人数",
      },
      series: [
        {
          name: "迟到人数",
          type: "line",
          data: dateTrendData.value.map((item) => item.lateCount),
          itemStyle: {
            color: "#e6a23c",
          },
          lineStyle: {
            color: "#e6a23c",
          },
        },
        {
          name: "缺勤人数",
          type: "line",
          data: dateTrendData.value.map((item) => item.absentCount),
          itemStyle: {
            color: "#f56c6c",
          },
          lineStyle: {
            color: "#f56c6c",
          },
        },
        {
          name: "请假人数",
          type: "line",
          data: dateTrendData.value.map((item) => item.leaveCount),
          itemStyle: {
            color: "#409eff",
          },
          lineStyle: {
            color: "#409eff",
          },
        },
        {
          name: "总异常人数",
          type: "line",
          data: dateTrendData.value.map((item) => item.totalAbnormalCount),
          itemStyle: {
            color: "#67c23a",
          },
          lineStyle: {
            color: "#67c23a",
            width: 3,
          },
        },
      ],
    };

    trendChartInstance.setOption(option);

    // 响应窗口大小变化
    window.addEventListener("resize", () => {
      trendChartInstance?.resize();
    });
  });
};

// 渲染时长分布图表
const renderDurationChart = () => {
  if (!durationChart.value || lateDurationStats.value.length === 0) return;

  nextTick(() => {
    if (durationChartInstance) {
      durationChartInstance.dispose();
    }

    durationChartInstance = echarts.init(durationChart.value!);

    const option = {
      title: {
        text: "迟到时长分布",
        left: "center",
        top: 10,
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}人 ({d}%)",
      },
      legend: {
        orient: "horizontal",
        bottom: 10,
        left: "center",
      },
      series: [
        {
          name: "迟到时长分布",
          type: "pie",
          radius: ["30%", "55%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          label: {
            show: true,
            formatter: "{b}: {d}%",
            fontSize: 12,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: "bold",
            },
          },
          data: lateDurationStats.value.map((item) => ({
            name: item.durationRange,
            value: item.count,
          })),
          itemStyle: {
            color: (params: any) => {
              const colors = ["#e6a23c", "#f56c6c", "#409eff", "#67c23a"];
              return colors[params.dataIndex % colors.length];
            },
          },
        },
      ],
    };

    durationChartInstance.setOption(option);

    // 响应窗口大小变化
    window.addEventListener("resize", () => {
      durationChartInstance?.resize();
    });
  });
};

// 导出报表
const exportReport = async () => {
  try {
    await ElMessageBox.confirm("确认导出当前统计报表吗？", "导出确认", {
      confirmButtonText: "确认",
      cancelButtonText: "取消",
      type: "warning",
    });

    ElMessage.success("导出成功，报表已开始下载");
    // 在实际项目中，这里会触发报表下载
    console.log("导出统计报表");
  } catch (error) {
    if (error !== "cancel") {
      console.error("导出失败:", error);
      ElMessage.error("导出失败");
    }
  }
};

// 初始化加载
onMounted(() => {
  fetchDashboardData();
  fetchLateDurationStats();
  fetchClassList();
  handleSearch();
});

// 组件卸载时清理
onUnmounted(() => {
  if (trendChartInstance) {
    trendChartInstance.dispose();
    trendChartInstance = null;
  }
  if (durationChartInstance) {
    durationChartInstance.dispose();
    durationChartInstance = null;
  }

  // 移除事件监听器
  window.removeEventListener("resize", () => {
    trendChartInstance?.resize();
  });
  window.removeEventListener("resize", () => {
    durationChartInstance?.resize();
  });
});
</script>

<style scoped lang="scss">
.statistics {
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

.section-title {
  margin: 30px 0 20px 0;
  color: #303133;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.dashboard-section {
  .dashboard-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 20px;

    .dashboard-card {
      .card-content {
        display: flex;
        align-items: center;
        gap: 20px;

        .card-icon {
          width: 60px;
          height: 60px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;

          .el-icon {
            font-size: 28px;
          }
        }

        .card-info {
          .card-value {
            font-size: 28px;
            font-weight: bold;
            color: #303133;
            margin-bottom: 5px;
          }

          .card-label {
            font-size: 14px;
            color: #909399;
          }
        }
      }
    }
  }
}

.filter-section {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.student-stats,
.class-stats {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  .highlight-warning {
    color: #e6a23c;
    font-weight: bold;
  }

  .highlight-danger {
    color: #f56c6c;
    font-weight: bold;
  }

  .rate-text {
    margin-left: 10px;
    font-weight: bold;
  }
}

.date-trend {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;

  .chart-container {
    margin-top: 20px;
  }
}

.late-report-section {
  .late-stats-content {
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-top: 20px;

    @media (min-width: 1200px) {
      flex-direction: row;

      .duration-distribution {
        flex: 0 0 45%;
        min-width: 0;
      }

      .late-details {
        flex: 1;
        min-width: 0;
      }
    }

    .duration-distribution,
    .late-details {
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

      h4 {
        margin: 0 0 20px 0;
        color: #303133;
        font-size: 16px;
        font-weight: 600;
      }

      .distribution-chart {
        margin-top: 20px;
      }

      .no-remark {
        color: #909399;
        font-style: italic;
      }
    }
  }
}

// 表格样式增强
:deep(.el-table) {
  .el-table__header-wrapper th {
    background-color: #f5f7fa;
    font-weight: 600;
  }

  .el-table__body tr:hover {
    background-color: #f5f7fa;
  }
}

// 进度条样式
:deep(.el-progress) {
  .el-progress-bar {
    margin-right: 0;
  }
}
</style>
