<script setup lang="ts">
import { roomStore } from '@/stores/room'
import { ref, onMounted, nextTick } from 'vue'

onMounted(async () => {
  roomStore.setVideoElementCurrentUser(
    document.getElementById('currentUserVideoElement') as HTMLVideoElement
  )
})
</script>

<template>
  <video
    style="width: 100% !important; height: auto !important"
    id="currentUserVideoElement"
    autoplay
    muted
  ></video>
</template>

<style scoped></style>
