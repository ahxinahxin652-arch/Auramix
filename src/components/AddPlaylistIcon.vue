<script setup>
defineProps({
  isSaved: {
    type: Boolean,
    required: true
  }
})
</script>

<template>
  <div class="add-playlist-icon">
    <svg v-if="isSaved" viewBox="0 0 24 24" width="16" height="16" fill="none">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#9333ea"/>
    </svg>
    <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  </div>
</template>

<style scoped>
.add-playlist-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
