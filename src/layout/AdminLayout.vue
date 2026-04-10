<template>
  <div class="admin-layout">
    <!-- 顶部导航栏 -->
    <TopBar />

    <div class="layout-container">
      <!-- 侧边栏 -->
      <Sidebar />

      <!-- 主内容区域 -->
      <div class="main-content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import TopBar from '@/components/common/TopBar.vue'
import Sidebar from '@/components/business/Sidebar.vue'
</script>

<style lang="scss" scoped>
.admin-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-container {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f5f7fa;

  // 兼容不同浏览器滚动条样式
  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;

    &:hover {
      background: #a8a8a8;
    }
  }
}
</style>