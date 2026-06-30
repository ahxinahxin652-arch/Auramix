<script setup lang="ts">
interface Item {
  label: string
  value: number | string
  sub?: string
}

interface Props {
  items: Item[]
  emptyText?: string
}

const props = withDefaults(defineProps<Props>(), {
  emptyText: '暂无数据',
})
</script>

<template>
  <ul v-if="props.items.length > 0" class="rank-list">
    <li v-for="(item, idx) in props.items" :key="idx" class="rank-list__item">
      <span class="rank-list__index" :class="{ 'is-top': idx < 3 }">{{ idx + 1 }}</span>
      <div class="rank-list__body">
        <div class="rank-list__label">{{ item.label }}</div>
        <div v-if="item.sub" class="rank-list__sub">{{ item.sub }}</div>
      </div>
      <span class="rank-list__value">{{ item.value }}</span>
    </li>
  </ul>
  <el-empty v-else :description="props.emptyText" :image-size="60" />
</template>

<style scoped lang="scss">
.rank-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    border-radius: $radius-sm;
    transition: background-color .15s;

    &:hover { background: $bg-subtle; }
  }

  &__index {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: $bg-subtle;
    color: $text-tertiary;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
    justify-content: center;

    &.is-top {
      background: $primary-color;
      color: #fff;
    }
  }

  &__body {
    flex: 1;
    min-width: 0;
  }

  &__label {
    font-size: $font-size-sm;
    color: $text-primary;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__sub {
    font-size: $font-size-2xs;
    color: $text-tertiary;
  }

  &__value {
    font-size: $font-size-sm;
    color: $primary-color;
    font-weight: 700;
  }
}
</style>