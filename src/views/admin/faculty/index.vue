<template>
  <div class="faculty-management">
    <div class="header">
      <h1>教职工管理</h1>
      <div class="header-actions">
        <el-button type="primary" @click="handleAddFaculty">
          <el-icon><Plus /></el-icon> 添加教职工
        </el-button>
        <el-button @click="handleImport">
          <el-icon><Upload /></el-icon> 批量导入
        </el-button>
        <el-button @click="handleExport">
          <el-icon><Download /></el-icon> 导出数据
        </el-button>
      </div>
    </div>

    <!-- 搜索筛选 -->
    <el-card class="search-card">
      <el-form :model="searchForm" label-width="80px">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="工号">
              <el-input
                v-model="searchForm.employeeId"
                placeholder="请输入工号"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="姓名">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入姓名"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="部门">
              <el-input
                v-model="searchForm.department"
                placeholder="请输入部门"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="职位">
              <el-input
                v-model="searchForm.position"
                placeholder="请输入职位"
                clearable
              />
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="角色">
              <el-select
                v-model="searchForm.role"
                placeholder="请选择角色"
                clearable
              >
                <el-option label="教师" value="teacher" />
                <el-option label="辅导员" value="counselor" />
                <el-option label="院系管理员" value="department_admin" />
                <el-option label="系统管理员" value="system_admin" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="6">
            <el-form-item label="状态">
              <el-select
                v-model="searchForm.status"
                placeholder="请选择状态"
                clearable
              >
                <el-option label="在职" value="active" />
                <el-option label="请假" value="leave" />
                <el-option label="外聘" value="external" />
                <el-option label="离职" value="resigned" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12" class="search-actions">
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
        :data="facultyList"
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="employeeId" label="工号" width="120" />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="department" label="部门" width="180" />
        <el-table-column prop="position" label="职位" width="120" />
        <el-table-column prop="phone" label="联系方式" width="150" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="role" label="角色" width="120">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)">
              {{ getRoleLabel(row.role) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="attendancePermission"
          label="考勤权限"
          width="150"
        >
          <template #default="{ row }">
            {{ getPermissionLabel(row.attendancePermission) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="accountEnabled" label="账号状态" width="100">
          <template #default="{ row }">
            <el-switch
              v-model="row.accountEnabled"
              @change="handleToggleAccount(row)"
              :active-value="true"
              :inactive-value="false"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleEdit(row)"
              :icon="Edit"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="handleDelete(row)"
              :icon="Delete"
            >
              删除
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

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="工号" prop="employeeId">
          <el-input
            v-model="formData.employeeId"
            placeholder="请输入工号"
            :disabled="isEditMode"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="部门" prop="department">
          <el-input v-model="formData.department" placeholder="请输入部门" />
        </el-form-item>
        <el-form-item label="职位" prop="position">
          <el-input v-model="formData.position" placeholder="请输入职位" />
        </el-form-item>
        <el-form-item label="联系方式" prop="phone">
          <el-input v-model="formData.phone" placeholder="请输入联系方式" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="formData.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="formData.role" placeholder="请选择角色">
            <el-option label="教师" value="teacher" />
            <el-option label="辅导员" value="counselor" />
            <el-option label="院系管理员" value="department_admin" />
            <el-option label="系统管理员" value="system_admin" />
          </el-select>
        </el-form-item>
        <el-form-item label="考勤权限" prop="attendancePermission">
          <el-select
            v-model="formData.attendancePermission"
            placeholder="请选择考勤权限"
          >
            <el-option label="无权限" value="none" />
            <el-option label="查看所带班级" value="view_own_class" />
            <el-option label="查看所有班级" value="view_all_classes" />
            <el-option label="修改所带班级" value="modify_own_class" />
            <el-option label="修改所有班级" value="modify_all_classes" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="在职" value="active" />
            <el-option label="请假" value="leave" />
            <el-option label="外聘" value="external" />
            <el-option label="离职" value="resigned" />
          </el-select>
        </el-form-item>
        <el-form-item label="账号启用" prop="accountEnabled">
          <el-switch
            v-model="formData.accountEnabled"
            :active-value="true"
            :inactive-value="false"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 批量导入对话框 -->
    <ImportDialog
      v-model="importDialogVisible"
      type="faculty"
      @success="handleImportSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import {
  Plus,
  Upload,
  Download,
  Search,
  Refresh,
  Edit,
  Delete,
} from "@element-plus/icons-vue";
import ImportDialog from "@/components/business/ImportDialog.vue";

// 导入逻辑
import {
  // 数据
  loading,
  facultyList,
  selectedRows,
  dialogVisible,
  importDialogVisible,
  isEditMode,
  formRef,

  // 搜索表单
  searchForm,

  // 分页
  pagination,

  // 表单数据
  formData,

  // 表单验证规则
  formRules,

  // 计算属性
  dialogTitle,

  // 方法
  fetchFaculties,
  handleSearch,
  handleReset,
  handleAddFaculty,
  handleEdit,
  handleDelete,
  handleSubmit,
  handleDialogClose,
  handleImport,
  handleExport,
  handleImportSuccess,
  handleToggleAccount,
  handleSelectionChange,
  handleSizeChange,
  handleCurrentChange,

  // 辅助函数
  getRoleLabel,
  getRoleTagType,
  getPermissionLabel,
  getStatusLabel,
  getStatusTagType,
} from "./facultyLogic";

// 生命周期
onMounted(() => {
  fetchFaculties();
});
</script>

<style scoped>
.faculty-management {
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
</style>
