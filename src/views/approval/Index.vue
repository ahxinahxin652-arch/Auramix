<script setup lang="ts">
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-approval">
    <PageHeader title="智能审批" subtitle="审核歌曲 / 专辑上传请求" />
    <el-card shadow="never" class="page-card">
      <EmptyState icon="CircleCheck" title="智能审批" hint="功能开发中" />
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
