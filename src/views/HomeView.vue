<script setup>
import { onMounted } from 'vue'
import { useMusicLibraryStore } from '../stores/musicLibrary.js'

const library = useMusicLibraryStore()

onMounted(() => {
  library.loadWarehouses()
})
</script>

<template>
  <div class="home-view"></div>
</template>
