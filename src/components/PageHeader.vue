<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="page-header">
    <div class="page-header__main">
      <h1 class="page-header__title">{{ title }}</h1>
      <p v-if="subtitle" class="page-header__subtitle">{{ subtitle }}</p>
    </div>
    <div class="page-header__actions">
      <slot name="actions" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: $spacing-md;
  padding: $spacing-lg $spacing-md;
  border-bottom: 1px solid $border-subtle;
  background: $bg-surface;

  &__main {
    flex: 1;
    min-width: 0;
  }

  &__title {
    margin: 0 0 $spacing-xs;
    font-size: $font-size-2xl;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.3;
  }

  &__subtitle {
    margin: 0;
    font-size: $font-size-sm;
    color: $text-tertiary;
    line-height: 1.4;
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: $spacing-sm;
    flex-shrink: 0;
  }
}
</style>
