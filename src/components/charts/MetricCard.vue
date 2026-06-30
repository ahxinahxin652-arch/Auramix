<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  hint?: string
  tone?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
}

const props = withDefaults(defineProps<Props>(), {
  hint: '',
  tone: 'primary',
})
</script>

<template>
  <div class="metric-card" :class="`metric-card--${props.tone}`">
    <div class="metric-card__label">{{ props.label }}</div>
    <div class="metric-card__value">{{ props.value }}</div>
    <div v-if="props.hint" class="metric-card__hint">{{ props.hint }}</div>
  </div>
</template>

<style scoped lang="scss">
.metric-card {
  background: $bg-card;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  padding: $spacing-md $spacing-lg;
  box-shadow: $shadow-card;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;

  &__label {
    font-size: $font-size-xs;
    color: $text-tertiary;
    font-weight: 500;
  }

  &__value {
    font-size: 28px;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
    word-break: break-all;
  }

  &__hint {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }

  &--primary { border-top: 3px solid $primary-color; }
  &--success { border-top: 3px solid $success-color; }
  &--warning { border-top: 3px solid $warning-color; }
  &--danger  { border-top: 3px solid $danger-color; }
  &--info    { border-top: 3px solid $info-color; }
}
</style>