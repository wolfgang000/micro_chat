<script setup lang="ts">
defineProps<{
  element_id: string
}>()
</script>

<template>
  <video :id="element_id" class="video-item" autoplay playsinline></video>
</template>

<style scoped>
.video-item {
  width: 400px;
  height: 400px;
  margin: 2rem;
  background: #2c3e50;
}
</style>
