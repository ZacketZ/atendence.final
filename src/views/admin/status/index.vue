<template>
  <div class="status-management">
    <div class="header">
      <h1>状态管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleRefresh">
          <el-icon><Refresh /></el-icon> 刷新
        </el-button>
      </div>
    </div>

    <!-- 系统统计 -->
    <el-card class="stats-card">
      <template #header>
        <div class="stats-header">
          <h3>系统统计</h3>
          <span class="update-time">更新时间：{{ updateTime }}</span>
        </div>
      </template>

      <div class="stats-content">
        <!-- 教职工统计 -->
        <div class="stats-section">
          <h4>教职工统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">总数</div>
              <div class="stat-value">{{ stats.faculty.total }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">在职</div>
              <div class="stat-value stat-success">
                {{ stats.faculty.active }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">请假</div>
              <div class="stat-value stat-warning">
                {{ stats.faculty.leave }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">外聘</div>
              <div class="stat-value stat-info">
                {{ stats.faculty.external }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">离职</div>
              <div class="stat-value stat-danger">
                {{ stats.faculty.resigned }}
              </div>
            </div>
          </div>
        </div>

        <!-- 学生统计 -->
        <div class="stats-section">
          <h4>学生统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">总数</div>
              <div class="stat-value">{{ stats.student.total }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">在校</div>
              <div class="stat-value stat-success">
                {{ stats.student.enrolled }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">休学</div>
              <div class="stat-value stat-warning">
                {{ stats.student.suspended }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">毕业</div>
              <div class="stat-value stat-info">
                {{ stats.student.graduated }}
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">退学</div>
              <div class="stat-value stat-danger">
                {{ stats.student.withdrawn }}
              </div>
            </div>
          </div>
        </div>

        <!-- 操作统计 -->
        <div class="stats-section">
          <h4>操作统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-label">近期操作</div>
              <div class="stat-value">{{ stats.recentOperations }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">今日操作</div>
              <div class="stat-value stat-primary">
                {{ stats.todayOperations }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 状态分布图表 -->
    <el-card class="chart-card">
      <template #header>
        <div class="chart-header">
          <h3>状态分布</h3>
          <div class="chart-actions">
            <el-radio-group v-model="chartType" size="small">
              <el-radio-button label="faculty">教职工</el-radio-button>
              <el-radio-button label="student">学生</el-radio-button>
            </el-radio-group>
          </div>
        </div>
      </template>

      <div class="chart-content">
        <div ref="chartRef" class="chart-container"></div>
      </div>
    </el-card>

    <!-- 状态说明 -->
    <el-card class="description-card">
      <template #header>
        <h3>状态说明</h3>
      </template>

      <div class="description-content">
        <div class="description-section">
          <h4>教职工状态</h4>
          <el-table :data="facultyStatusDescriptions" size="small" border>
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column prop="label" label="中文名称" width="100" />
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="actions" label="允许操作" width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="action in row.actions"
                  :key="action"
                  size="small"
                  class="action-tag"
                >
                  {{ action }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="description-section">
          <h4>学生状态</h4>
          <el-table :data="studentStatusDescriptions" size="small" border>
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column prop="label" label="中文名称" width="100" />
            <el-table-column prop="description" label="说明" />
            <el-table-column prop="actions" label="允许操作" width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="action in row.actions"
                  :key="action"
                  size="small"
                  class="action-tag"
                >
                  {{ action }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="description-section">
          <h4>账号状态</h4>
          <el-alert type="info" :closable="false">
            <template #title>
              <strong>账号状态说明：</strong>
            </template>
            <div class="alert-content">
              <p>1. 账号启用：用户可以正常登录系统</p>
              <p>2. 账号禁用：用户无法登录系统，但数据保留</p>
              <p>3. 离职/退学状态会自动禁用账号</p>
              <p>4. 管理员可以手动启用/禁用账号</p>
            </div>
          </el-alert>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick, watch } from "vue";
import { Refresh } from "@element-plus/icons-vue";
import * as echarts from "echarts";
import { getSystemStats } from "@/api/management";

// 数据
const stats = reactive({
  faculty: {
    total: 0,
    active: 0,
    leave: 0,
    external: 0,
    resigned: 0,
  },
  student: {
    total: 0,
    enrolled: 0,
    suspended: 0,
    graduated: 0,
    withdrawn: 0,
  },
  recentOperations: 0,
  todayOperations: 0,
});

const updateTime = ref("");
const chartType = ref<"faculty" | "student">("faculty");
const chartRef = ref<HTMLElement>();
let chartInstance: echarts.ECharts | null = null;

// 状态说明数据
const facultyStatusDescriptions = [
  {
    status: "active",
    label: "在职",
    description: "正常工作的教职工，可以正常使用系统所有功能",
    actions: ["登录", "考勤", "查看数据", "修改数据"],
  },
  {
    status: "leave",
    label: "请假",
    description: "暂时请假中的教职工，可以登录但部分功能受限",
    actions: ["登录", "查看数据"],
  },
  {
    status: "external",
    label: "外聘",
    description: "外聘教师或工作人员，权限根据合同设置",
    actions: ["登录", "考勤", "查看数据"],
  },
  {
    status: "resigned",
    label: "离职",
    description: "已离职的教职工，账号自动禁用",
    actions: ["无"],
  },
];

const studentStatusDescriptions = [
  {
    status: "enrolled",
    label: "在校",
    description: "正常在校学习的学生，可以正常使用系统",
    actions: ["登录", "查看课表", "查看考勤"],
  },
  {
    status: "suspended",
    label: "休学",
    description: "暂时休学的学生，账号自动禁用",
    actions: ["无"],
  },
  {
    status: "graduated",
    label: "毕业",
    description: "已毕业的学生，账号自动禁用",
    actions: ["无"],
  },
  {
    status: "withdrawn",
    label: "退学",
    description: "已退学的学生，账号自动禁用",
    actions: ["无"],
  },
];

// 方法
const fetchStats = async () => {
  try {
    const data = (await getSystemStats()) as any;

    // 更新统计数据
    Object.assign(stats.faculty, data.faculty);
    Object.assign(stats.student, data.student);
    stats.recentOperations = data.recentOperations;
    stats.todayOperations = data.todayOperations;

    // 更新时间
    updateTime.value = new Date().toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // 更新图表
    updateChart();
  } catch (error) {
    console.error("获取系统统计失败:", error);
  }
};

const handleRefresh = () => {
  fetchStats();
};

const initChart = () => {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);
  updateChart();
};

const updateChart = () => {
  if (!chartInstance) return;

  const isFaculty = chartType.value === "faculty";
  const data = isFaculty ? stats.faculty : stats.student;
  const labels = isFaculty
    ? ["在职", "请假", "外聘", "离职"]
    : ["在校", "休学", "毕业", "退学"];

  let values: number[] = [];
  if (isFaculty) {
    const facultyData = data as typeof stats.faculty;
    values = [
      facultyData.active,
      facultyData.leave,
      facultyData.external,
      facultyData.resigned,
    ];
  } else {
    const studentData = data as typeof stats.student;
    values = [
      studentData.enrolled,
      studentData.suspended,
      studentData.graduated,
      studentData.withdrawn,
    ];
  }

  const option = {
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)",
    },
    legend: {
      orient: "vertical",
      left: "left",
      data: labels,
    },
    series: [
      {
        name: isFaculty ? "教职工状态" : "学生状态",
        type: "pie",
        radius: ["50%", "70%"],
        avoidLabelOverlap: false,
        label: {
          show: false,
          position: "center",
        },
        emphasis: {
          label: {
            show: true,
            fontSize: "20",
            fontWeight: "bold",
          },
        },
        labelLine: {
          show: false,
        },
        data: labels.map((label, index) => ({
          name: label,
          value: values[index],
        })),
        color: ["#67c23a", "#e6a23c", "#409eff", "#f56c6c"],
      },
    ],
  };

  chartInstance.setOption(option);
};

const handleResize = () => {
  if (chartInstance) {
    chartInstance.resize();
  }
};

// 生命周期
onMounted(() => {
  fetchStats();
  nextTick(() => {
    initChart();
  });

  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  if (chartInstance) {
    chartInstance.dispose();
  }
  window.removeEventListener("resize", handleResize);
});

// 监听图表类型变化
watch(chartType, () => {
  updateChart();
});
</script>

<style scoped>
.status-management {
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

.stats-card {
  margin-bottom: 20px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.update-time {
  font-size: 14px;
  color: #909399;
}

.stats-content {
  padding: 10px 0;
}

.stats-section {
  margin-bottom: 30px;
}

.stats-section:last-child {
  margin-bottom: 0;
}

.stats-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  padding: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  text-align: center;
  transition: all 0.3s;
}

.stat-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.stat-label {
  margin-bottom: 10px;
  font-size: 14px;
  color: #606266;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-success {
  color: #67c23a;
}

.stat-warning {
  color: #e6a23c;
}

.stat-info {
  color: #409eff;
}

.stat-danger {
  color: #f56c6c;
}

.stat-primary {
  color: #409eff;
}

.chart-card {
  margin-bottom: 20px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.chart-content {
  padding: 10px 0;
}

.chart-container {
  width: 100%;
  height: 400px;
}

.description-card {
  margin-bottom: 20px;
}

.description-card h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.description-content {
  padding: 10px 0;
}

.description-section {
  margin-bottom: 30px;
}

.description-section:last-child {
  margin-bottom: 0;
}

.description-section h4 {
  margin: 0 0 15px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.action-tag {
  margin-right: 5px;
  margin-bottom: 5px;
}

.alert-content {
  font-size: 14px;
  line-height: 1.6;
}

.alert-content p {
  margin: 5px 0;
}
</style>
