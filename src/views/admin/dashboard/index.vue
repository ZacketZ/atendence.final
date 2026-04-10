<template>
  <div class="dashboard">
    <!-- 欢迎横幅 -->
    <el-card class="welcome-card">
      <div class="welcome-content">
        <div class="welcome-text">
          <h2>欢迎回来，{{ userInfo?.username }}！</h2>
          <p>今天是 {{ currentDate }}，祝您工作愉快！</p>
        </div>
        <div class="welcome-stats">
          <div class="stat-item">
            <div class="stat-value">{{ todayStats?.total || 0 }}</div>
            <div class="stat-label">今日总人数</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ todayStats?.checkedIn || 0 }}</div>
            <div class="stat-label">已签到</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ todayStats?.pending || 0 }}</div>
            <div class="stat-label">待签到</div>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 快速操作 -->
    <div class="quick-actions">
      <h3>快速操作</h3>
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="action-card" @click="goTo('/admin/schedule')">
            <el-icon class="action-icon"><Calendar /></el-icon>
            <h4>课表管理</h4>
            <p>查看和管理课程安排</p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="action-card" @click="goTo('/admin/attendance')">
            <el-icon class="action-icon"><List /></el-icon>
            <h4>考勤管理</h4>
            <p>查看考勤记录和异常</p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="action-card" @click="goTo('/admin/statistics')">
            <el-icon class="action-icon"><TrendCharts /></el-icon>
            <h4>统计报表</h4>
            <p>查看数据分析和报表</p>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="action-card" @click="goTo('/admin/users/staff')">
            <el-icon class="action-icon"><User /></el-icon>
            <h4>用户管理</h4>
            <p>管理系统用户账号</p>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 最近活动 -->
    <div class="recent-activities">
      <h3>最近活动</h3>
      <el-table :data="recentActivities" style="width: 100%">
        <el-table-column prop="time" label="时间" width="180" />
        <el-table-column prop="user" label="用户" width="120" />
        <el-table-column prop="action" label="操作" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'success' ? 'success' : 'danger'">
              {{ row.status === 'success' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useUserStore } from '@/store/user'
import { useRouter } from 'vue-router'
import {
  Calendar,
  List,
  TrendCharts,
  User
} from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 当前日期
const currentDate = ref(new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
}))

// 今日统计数据
const todayStats = ref({
  total: 120,
  checkedIn: 95,
  pending: 25
})

// 最近活动
const recentActivities = ref([
  {
    time: '2024-01-20 09:15',
    user: '张三',
    action: '完成签到',
    status: 'success'
  },
  {
    time: '2024-01-20 09:10',
    user: '李四',
    action: '提交请假申请',
    status: 'success'
  },
  {
    time: '2024-01-20 09:00',
    user: '王五',
    action: '签到失败',
    status: 'danger'
  }
])

// 跳转到指定页面
const goTo = (path: string) => {
  router.push(path)
}
</script>

<style lang="scss" scoped>
.dashboard {
  .welcome-card {
    margin-bottom: 24px;

    .welcome-content {
      display: flex;
      justify-content: space-between;
      align-items: center;

      .welcome-text {
        h2 {
          font-size: 24px;
          color: #303133;
          margin-bottom: 8px;
        }

        p {
          color: #606266;
          margin: 0;
        }
      }

      .welcome-stats {
        display: flex;
        gap: 32px;

        .stat-item {
          text-align: center;

          .stat-value {
            font-size: 28px;
            font-weight: bold;
            color: #409EFF;
          }

          .stat-label {
            color: #606266;
            font-size: 14px;
          }
        }
      }
    }
  }

  .quick-actions {
    margin-bottom: 24px;

    h3 {
      margin-bottom: 16px;
      color: #303133;
    }

    .action-card {
      cursor: pointer;
      transition: all 0.3s;

      &:hover {
        transform: translateY(-4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }

      .action-icon {
        font-size: 32px;
        color: #409EFF;
        margin-bottom: 12px;
      }

      h4 {
        margin: 0 0 8px 0;
        color: #303133;
      }

      p {
        margin: 0;
        color: #606266;
        font-size: 14px;
      }
    }
  }

  .recent-activities {
    h3 {
      margin-bottom: 16px;
      color: #303133;
    }
  }
}
</style>