<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'

const auth = useAuthStore()
</script>

<template>
  <div class="page-home">
    <el-card class="welcome-card" shadow="hover">
      <h2 class="welcome-title">欢迎回来,{{ auth.profile?.username }}</h2>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="用户名">{{ auth.profile?.username }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">{{ auth.profile?.email }}</el-descriptions-item>
        <el-descriptions-item label="角色">
          <el-tag :type="auth.profile?.isRoot === 1 ? 'danger' : 'info'" size="small">
            {{ auth.profile?.isRoot === 1 ? '超级管理员' : '普通管理员' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="auth.profile?.status === 1 ? 'success' : 'warning'" size="small">
            {{ auth.profile?.status === 1 ? '正常' : '已停用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="最后登录时间">
          {{ auth.profile?.lastLoginTime || '首次登录' }}
        </el-descriptions-item>
        <el-descriptions-item label="最后登录 IP">
          {{ auth.profile?.lastLoginIp || '-' }}
        </el-descriptions-item>
        <el-descriptions-item label="创建时间" :span="2">
          {{ auth.profile?.createdAt }}
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-home {
  max-width: 960px;
  margin: 0 auto;
}

.welcome-card {
  margin-bottom: $spacing-lg;
}

.welcome-title {
  margin: 0 0 $spacing-lg;
  font-size: $font-size-xl;
  color: #303133;
}
</style>
