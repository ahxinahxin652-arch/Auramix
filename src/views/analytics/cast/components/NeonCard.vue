<script setup lang="ts">
interface Props {
  /** 标题文字 */
  title?: string
  /** 副标题 / 角标 */
  corner?: string
  /** 是否显示右上角装饰点 */
  dot?: boolean
  /** 内边距大小 */
  padding?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  corner: '',
  dot: false,
  padding: 'md',
})
</script>

<template>
  <div class="neon-card" :class="`neon-card--${props.padding}`">
    <!-- 四角装饰 -->
    <span class="neon-corner neon-corner--tl" />
    <span class="neon-corner neon-corner--tr" />
    <span class="neon-corner neon-corner--bl" />
    <span class="neon-corner neon-corner--br" />

    <!-- 标题栏 -->
    <div v-if="props.title || props.corner" class="neon-header">
      <div class="neon-header__left">
        <span v-if="props.dot" class="neon-header__dot" />
        <span class="neon-header__title">{{ props.title }}</span>
      </div>
      <span v-if="props.corner" class="neon-header__corner">{{ props.corner }}</span>
    </div>

    <div class="neon-body">
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.neon-card {
  position: relative;
  background: linear-gradient(135deg, rgba(8, 22, 56, 0.85) 0%, rgba(6, 14, 36, 0.85) 100%);
  border: 1px solid rgba(56, 189, 248, 0.35);
  border-radius: 4px;
  backdrop-filter: blur(2px);
  box-shadow:
    0 0 18px rgba(56, 189, 248, 0.15) inset,
    0 0 30px rgba(8, 14, 36, 0.6);

  &--sm { padding: 12px 16px; }
  &--md { padding: 18px 22px; }
  &--lg { padding: 24px 28px; }
}

.neon-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 14px;
  border-bottom: 1px solid rgba(56, 189, 248, 0.18);

  &__left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #38bdf8;
    box-shadow: 0 0 8px #38bdf8, 0 0 14px #38bdf8;
    animation: pulse 1.6s ease-in-out infinite;
  }

  &__title {
    font-size: 16px;
    font-weight: 600;
    color: #e0f2fe;
    letter-spacing: 1px;
    text-shadow: 0 0 8px rgba(56, 189, 248, 0.4);
  }

  &__corner {
    font-size: 11px;
    color: rgba(125, 211, 252, 0.6);
    letter-spacing: 1.5px;
    font-family: 'Consolas', 'Monaco', monospace;
  }
}

.neon-body {
  position: relative;
  z-index: 1;
}

.neon-corner {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 2px solid #38bdf8;
  box-shadow: 0 0 6px rgba(56, 189, 248, 0.6);

  &--tl { top: -1px; left: -1px; border-right: none; border-bottom: none; }
  &--tr { top: -1px; right: -1px; border-left: none; border-bottom: none; }
  &--bl { bottom: -1px; left: -1px; border-right: none; border-top: none; }
  &--br { bottom: -1px; right: -1px; border-left: none; border-top: none; }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.7); }
}
</style>