<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { Headset } from '@element-plus/icons-vue'
import * as ElIcons from '@element-plus/icons-vue'

const props = defineProps<{
  icon: string
  label: string
  value: string | number
  delta?: number
  href?: string
}>()

const router = useRouter()

const iconMap = ElIcons as unknown as Record<string, unknown>
function resolveIcon(name: string) {
  return iconMap[name] || Headset
}

const deltaTone = computed<'up' | 'down' | 'flat' | null>(() => {
  if (props.delta === undefined) return null
  if (props.delta > 0) return 'up'
  if (props.delta < 0) return 'down'
  return 'flat'
})

const deltaSymbol = computed(() => {
  if (deltaTone.value === 'up') return '↑'
  if (deltaTone.value === 'down') return '↓'
  return '—'
})

const deltaText = computed(() => {
  if (props.delta === undefined) return ''
  return `${deltaSymbol.value} ${Math.abs(props.delta)}%`
})

const isLink = computed(() => !!props.href)

function handleClick() {
  if (props.href) router.push(props.href)
}

function handleKeydown(e: KeyboardEvent) {
  if (!isLink.value) return
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    handleClick()
  }
}
</script>

<template>
  <div
    class="stat-card"
    :class="{ 'stat-card--link': isLink }"
    :role="isLink ? 'button' : 'article'"
    :tabindex="isLink ? 0 : undefined"
    :aria-label="isLink ? `查看${label}` : undefined"
    @click="handleClick"
    @keydown="handleKeydown"
  >
    <div class="stat-card__icon">
      <component :is="resolveIcon(icon)" :size="20" />
    </div>
    <div class="stat-card__body">
      <div class="stat-card__label">{{ label }}</div>
      <div class="stat-card__value">{{ value }}</div>
      <div v-if="deltaTone" class="stat-card__delta" :class="`stat-card__delta--${deltaTone}`">
        {{ deltaText }}
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: $spacing-md;
  padding: $spacing-lg;
  background: $bg-surface;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  transition:
    transform 150ms ease-out,
    box-shadow 150ms ease-out,
    border-color 150ms;

  &--link {
    cursor: pointer;

    &:hover {
      transform: translateY(-1px);
      box-shadow: $shadow-card;
      border-color: $primary-color;
    }

    &:focus-visible {
      outline: 2px solid $primary-color;
      outline-offset: 2px;
    }
  }

  &__icon {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: $font-size-sm;
    color: $text-tertiary;
    margin-bottom: $spacing-xs;
  }

  &__value {
    font-size: $font-size-2xl;
    font-weight: 700;
    color: $text-primary;
    line-height: 1.2;
  }

  &__delta {
    margin-top: $spacing-xs;
    font-size: $font-size-xs;
    font-weight: 500;

    &--up {
      color: $success-color;
    }

    &--down {
      color: $danger-color;
    }

    &--flat {
      color: $text-tertiary;
    }
  }
}
</style>
