<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

interface Crumb {
  title: string
  path: string
}

const crumbs = computed<Crumb[]>(() => {
  const matched = route.matched
    .filter((r) => r.meta?.title)
    .map((r) => ({ title: r.meta.title as string, path: r.path }))
  // 末级不可点:除最后一项外都加 path,最后一项用空 path
  return matched.map((c, i) => ({
    title: c.title,
    path: i === matched.length - 1 ? '' : c.path,
  }))
})
</script>

<template>
  <nav class="breadcrumb" aria-label="breadcrumb">
    <template v-for="(c, i) in crumbs" :key="c.path || i">
      <span v-if="i > 0" class="breadcrumb__sep">/</span>
      <router-link v-if="c.path" :to="c.path" class="breadcrumb__link">{{ c.title }}</router-link>
      <span v-else class="breadcrumb__current" aria-current="page">{{ c.title }}</span>
    </template>
  </nav>
</template>

<style scoped lang="scss">
.breadcrumb {
  display: flex;
  align-items: center;
  gap: $spacing-sm;
  height: $breadcrumb-height;
  padding: 0 $spacing-md;
  background: $bg-page;
  border-bottom: 1px solid $border-subtle;
  font-size: $font-size-sm;

  &__sep {
    color: $text-tertiary;
  }

  &__link {
    color: $text-secondary;
    cursor: pointer;
    transition: color 150ms;

    &:hover {
      color: $primary-color;
    }
  }

  &__current {
    color: $text-primary;
    font-weight: 500;
  }
}
</style>
