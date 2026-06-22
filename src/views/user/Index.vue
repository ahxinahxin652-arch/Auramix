<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-user">
    <PageHeader title="用户管理" subtitle="管理平台所有用户信息">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建用户
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="User" title="用户管理" hint="功能开发中" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-card {
  border: 1px solid $border-base;
  border-radius: $radius-md;
  margin-top: $spacing-md;
}
</style>
