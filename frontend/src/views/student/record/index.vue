<template>
  <div class="record-container">
    <div class="page-header">
      <h2>考勤记录</h2>
      <p>查看我的签到打卡记录</p>
    </div>

    <!-- 统计摘要 -->
    <div class="stats-cards">
      <div class="stat-card">
        <div class="stat-value">{{ stats.total }}</div>
        <div class="stat-label">总签到</div>
      </div>
      <div class="stat-card success">
        <div class="stat-value">{{ stats.normal }}</div>
        <div class="stat-label">正常</div>
      </div>
      <div class="stat-card warning">
        <div class="stat-value">{{ stats.abnormal }}</div>
        <div class="stat-label">异常</div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filter-bar">
      <el-select
        v-model="filterStatus"
        placeholder="筛选状态"
        clearable
        @change="handleFilter"
        style="width: 140px"
      >
        <el-option label="全部" value="" />
        <el-option label="正常" value="normal" />
        <el-option label="异常" value="abnormal" />
      </el-select>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <el-skeleton :rows="4" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredRecords.length === 0" class="empty-state">
      <el-empty description="暂无考勤记录" />
    </div>

    <!-- 记录列表 -->
    <div v-else class="record-list">
      <div
        v-for="record in filteredRecords"
        :key="record.id"
        class="record-card"
      >
        <div class="record-left">
          <div
            class="record-icon"
            :class="
              record.final_status === 'normal' ? 'icon-success' : 'icon-danger'
            "
          >
            <el-icon :size="20">
              <CircleCheckFilled v-if="record.final_status === 'normal'" />
              <WarningFilled v-else />
            </el-icon>
          </div>
        </div>
        <div class="record-body">
          <div class="record-title">{{ record.title || "未知活动" }}</div>
          <div class="record-meta">
            <span>签到时间：{{ formatDateTime(record.check_time) }}</span>
            <span v-if="record.gps_longitude">
              位置：{{ formatCoord(record.gps_longitude) }},
              {{ formatCoord(record.gps_latitude) }}
            </span>
          </div>
        </div>
        <div class="record-right">
          <el-tag
            :type="record.final_status === 'normal' ? 'success' : 'danger'"
            effect="plain"
            size="small"
          >
            {{ record.final_status === "normal" ? "正常" : "异常" }}
          </el-tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { CircleCheckFilled, WarningFilled } from "@element-plus/icons-vue";
import { getStudentRecords } from "@/api/attendance";
import type { Record } from "@/api/attendance";

const loading = ref(true);
const records = ref<Record[]>([]);
const filterStatus = ref("");

// 统计
const stats = computed(() => {
  const total = records.value.length;
  const normal = records.value.filter(
    (r) => r.final_status === "normal",
  ).length;
  const abnormal = total - normal;
  return { total, normal, abnormal };
});

// 筛选后的记录
const filteredRecords = computed(() => {
  if (!filterStatus.value) return records.value;
  return records.value.filter((r) => r.final_status === filterStatus.value);
});

function formatDateTime(dateStr: string) {
  if (!dateStr) return "";
  return dateStr.substring(0, 19).replace("T", " ");
}

function formatCoord(val: any): string {
  if (val === null || val === undefined) return "";
  const num = Number(val);
  if (isNaN(num)) return String(val);
  return num.toFixed(4);
}

function handleFilter() {
  // computed 会自动响应
}

async function loadRecords() {
  loading.value = true;
  try {
    records.value = await getStudentRecords();
  } catch {
    ElMessage.error("加载考勤记录失败");
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadRecords();
});
</script>

<style scoped lang="scss">
.record-container {
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

.stats-cards {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-card {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);

  .stat-value {
    font-size: 28px;
    font-weight: 600;
    color: #303133;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
    margin-top: 4px;
  }

  &.success .stat-value {
    color: #67c23a;
  }

  &.warning .stat-value {
    color: #e6a23c;
  }
}

.filter-bar {
  margin-bottom: 16px;
}

.loading-state {
  padding: 40px 20px;
  background: #fff;
  border-radius: 8px;
}

.empty-state {
  background: #fff;
  border-radius: 8px;
  padding: 40px 0;
}

.record-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.record-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  }
}

.record-left {
  flex-shrink: 0;
}

.record-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;

  &.icon-success {
    background: #f0f9eb;
    color: #67c23a;
  }

  &.icon-danger {
    background: #fef0f0;
    color: #f56c6c;
  }
}

.record-body {
  flex: 1;
  min-width: 0;
}

.record-title {
  font-size: 15px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 4px;
}

.record-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 13px;
  color: #909399;
}

.record-right {
  flex-shrink: 0;
}
</style>
