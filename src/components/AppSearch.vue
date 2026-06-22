<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { Search } from '@element-plus/icons-vue'

withDefaults(
  defineProps<{ placeholder?: string }>(),
  { placeholder: '搜索 ⌘K' },
)

const inputRef = ref<HTMLInputElement | null>(null)

function onKeydown(e: KeyboardEvent) {
  // Ctrl+K (Win/Linux) 或 ⌘K (Mac)
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="app-search">
    <Search class="app-search__icon" />
    <input
      ref="inputRef"
      type="text"
      class="app-search__input"
      :placeholder="placeholder"
      @change="(e) => console.log('search:', (e.target as HTMLInputElement).value)"
    >
    <span class="app-search__shortcut">⌘K</span>
  </div>
</template>

<style scoped lang="scss">
.app-search {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
  padding: 0 $spacing-sm;
  background: $bg-subtle;
  border: 1px solid $border-base;
  border-radius: $radius-md;
  max-width: 320px;
  transition: border-color 150ms, background 150ms;

  &:focus-within {
    border-color: $primary-color;
    background: $bg-surface;
  }

  &__icon {
    color: $text-tertiary;
    margin-right: $spacing-sm;
    font-size: 14px;
  }

  &__input {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: $font-size-sm;
    color: $text-primary;
    min-width: 0;

    &::placeholder {
      color: $text-tertiary;
    }
  }

  &__shortcut {
    color: $text-tertiary;
    font-size: $font-size-xs;
    font-family: ui-monospace, 'SF Mono', Menlo, monospace;
    padding: 2px $spacing-xs;
    border: 1px solid $border-base;
    border-radius: $radius-sm;
    background: $bg-surface;
    flex-shrink: 0;
  }
}
</style>
