<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue'
import PageHeader from '@/components/PageHeader.vue'
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <div class="page-song">
    <PageHeader title="歌曲管理" subtitle="管理平台曲库所有歌曲">
      <template #actions>
        <el-button type="primary">
          <el-icon><Plus /></el-icon>
          新建歌曲
        </el-button>
      </template>
    </PageHeader>
    <el-card shadow="never" class="page-card">
      <EmptyState icon="Headset" title="歌曲管理" hint="功能开发中" />
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
