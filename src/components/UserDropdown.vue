<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown } from '@element-plus/icons-vue'

const props = withDefaults(
  defineProps<{
    username: string
    email?: string
    isRoot?: 0 | 1
  }>(),
  { isRoot: 0, email: '' },
)

defineEmits<{
  logout: []
  profile: []
}>()

const initial = computed(() => {
  return props.username ? props.username.charAt(0).toUpperCase() : '?'
})

const roleLabel = computed(() => (props.isRoot === 1 ? '超级管理员' : '普通管理员'))
</script>

<template>
  <el-dropdown trigger="click" class="user-dropdown">
    <span class="user-dropdown__trigger">
      <span class="user-dropdown__avatar">{{ initial }}</span>
      <span class="user-dropdown__name">{{ username }}</span>
      <ArrowDown class="user-dropdown__caret" />
    </span>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="user-dropdown__card">
          <div class="user-dropdown__card-avatar">{{ initial }}</div>
          <div class="user-dropdown__card-info">
            <div class="user-dropdown__card-name">{{ username }}</div>
            <div v-if="email" class="user-dropdown__card-email">{{ email }}</div>
            <div
              class="user-dropdown__card-role"
              :class="{ 'user-dropdown__card-role--root': isRoot === 1 }"
            >
              {{ roleLabel }}
            </div>
          </div>
        </div>
        <el-dropdown-item disabled @click="$emit('profile')"> 个人中心 </el-dropdown-item>
        <el-dropdown-item divided @click="$emit('logout')"> 退出登录 </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
.user-dropdown {
  &__trigger {
    display: inline-flex;
    align-items: center;
    gap: $spacing-sm;
    padding: $spacing-xs $spacing-sm;
    cursor: pointer;
    border-radius: $radius-md;
    transition: background 150ms;

    &:hover {
      background: $bg-subtle;
    }
  }

  &__avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-sm;
    font-weight: 600;
    line-height: 1;
  }

  &__name {
    font-size: $font-size-sm;
    color: $text-primary;
    font-weight: 500;
  }

  &__caret {
    color: $text-tertiary;
    font-size: 12px;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: $spacing-md;
    padding: $spacing-md;
    width: 240px;
    border-bottom: 1px solid $border-subtle;
  }

  &__card-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: $primary-soft;
    color: $primary-color;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: $font-size-md;
    font-weight: 600;
    flex-shrink: 0;
  }

  &__card-info {
    min-width: 0;
    flex: 1;
  }

  &__card-name {
    font-size: $font-size-md;
    font-weight: 600;
    color: $text-primary;
    line-height: 1.2;
  }

  &__card-email {
    font-size: $font-size-xs;
    color: $text-tertiary;
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__card-role {
    display: inline-block;
    margin-top: $spacing-xs;
    padding: 1px $spacing-xs;
    border-radius: $radius-sm;
    font-size: $font-size-2xs;
    background: $bg-subtle;
    color: $text-tertiary;

    &--root {
      background: $primary-soft;
      color: $primary-color;
    }
  }
}
</style>
