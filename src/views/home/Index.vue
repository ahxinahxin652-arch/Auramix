<script setup lang="ts">
import { useAuthStore } from '@/store/modules/auth'
import PageHeader from '@/components/PageHeader.vue'
import StatCard from '@/components/StatCard.vue'

const auth = useAuthStore()

// 临时 mock 数据,接入 API 后替换
const stats = [
  { icon: 'Headset', label: '歌曲数', value: 1284, delta: 12, href: '/song' },
  { icon: 'User', label: '用户数', value: 3402, delta: 5, href: '/user' },
  { icon: 'CircleCheck', label: '待审批', value: 28, delta: -3, href: '/approval' },
  { icon: 'Plus', label: '今日新增', value: 12, delta: 0, href: '/home' },
]
</script>

<template>
  <div class="page-home">
    <PageHeader
      :title="`欢迎回来,${auth.profile?.username ?? ''}`"
      subtitle="这里是 Auramix Admin 的总览数据"
    />
    <div class="page-home__stats">
      <StatCard
        v-for="s in stats"
        :key="s.label"
        :icon="s.icon"
        :label="s.label"
        :value="s.value"
        :delta="s.delta"
        :href="s.href"
      />
    </div>
    <el-card shadow="never" class="page-home__recent">
      <template #header>
        <span class="page-home__recent-title">最近活动</span>
      </template>
      <el-empty description="暂无最近活动" :image-size="80" />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.page-home {
  &__stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: $spacing-md;
    padding: $spacing-md;
  }

  &__recent {
    margin: 0 $spacing-md $spacing-md;
    border: 1px solid $border-base;
    border-radius: $radius-md;
  }

  &__recent-title {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }
}

@media (max-width: 1024px) {
  .page-home__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .page-home__stats {
    grid-template-columns: 1fr;
  }
}
</style>
