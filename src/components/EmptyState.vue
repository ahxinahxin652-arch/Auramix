<script setup lang="ts">
import { User } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'

defineProps<{
  icon: string
  title: string
  hint?: string
}>()

// 根据字符串名解析 icon 组件
const iconMap = ElIcons as unknown as Record<string, unknown>
function resolveIcon(name: string) {
  return iconMap[name] || User
}
</script>

<template>
  <div class="empty-state">
    <div class="empty-state__icon">
      <component :is="resolveIcon(icon)" :size="22" />
    </div>
    <h3 class="empty-state__title">{{ title }}</h3>
    <p v-if="hint" class="empty-state__hint">{{ hint }}</p>
  </div>
</template>

<style scoped lang="scss">
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-xl * 2 $spacing-md;
  text-align: center;

  &__icon {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-md;
  }

  &__title {
    margin: 0 0 $spacing-xs;
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
  }

  &__hint {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-tertiary;
  }
}
</style>
