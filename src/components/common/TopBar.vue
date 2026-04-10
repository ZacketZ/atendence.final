<template>
  <div class="top-bar">
    <!-- 左侧：Logo 和面包屑 -->
    <div class="left-section">
      <div class="logo">

        <span class="logo-text">考勤系统</span>
      </div>
      <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/dashboard' }">
          {{ $route.meta.title || '首页' }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：用户信息 -->
    <div class="right-section">
      <!-- 通知图标 -->
      <el-tooltip content="通知" placement="bottom">
        <el-button circle size="small">
          <Bell />
        </el-button>
      </el-tooltip>

      <!-- 设置按钮 -->
      <el-tooltip content="设置" placement="bottom">
        <el-button circle size="small">
          <Setting />
        </el-button>
      </el-tooltip>

      <!-- 用户头像和下拉菜单 -->
      <el-dropdown @command="handleCommand">
        <div class="user-info">
          <el-avatar :size="32" :src="userInfo?.avatar || defaultAvatar" />
          <span class="username">{{ userInfo?.username || '用户' }}</span>
          <el-icon><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <User /> 个人信息
            </el-dropdown-item>
            <el-dropdown-item command="settings">
              <Setting /> 设置
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <SwitchButton /> 退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessageBox } from 'element-plus'
import { Bell, Setting, ArrowDown, User, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 默认头像
const defaultAvatar = 'https://cube.elemecdn.com/0/88/03b0d39583f48206768a563f534fjpeg.jpeg'

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 处理下拉菜单命令
const handleCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm(
          '确定要退出登录吗？',
          '提示',
          {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          }
        )
        userStore.clearUser()
        router.push('/login')
      } catch {
        // 用户取消退出
      }
      break
  }
}
</script>

<style lang="scss" scoped>
.top-bar {
  height: 60px;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  position: relative;
  z-index: 100;

  .left-section {
    display: flex;
    align-items: center;
    gap: 20px;

    .logo {
      display: flex;
      align-items: center;
      gap: 8px;

      .logo-image {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }

      .logo-text {
        font-size: 18px;
        font-weight: 600;
        color: #303133;
      }
    }
  }

  .right-section {
    display: flex;
    align-items: center;
    gap: 16px;

    .el-button {
      border: none;
      background: transparent;

      &:hover {
        background: #f5f7fa;
      }
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 12px;
      border-radius: 20px;
      cursor: pointer;
      transition: background 0.3s;

      &:hover {
        background: #f5f7fa;
      }

      .username {
        font-size: 14px;
        color: #303133;
      }
    }
  }
}
</style>