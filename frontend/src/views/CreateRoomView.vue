<script setup lang="ts">
import { useRouter } from 'vue-router'
import { v4 } from 'uuid'

const router = useRouter()

const onSubmit = () => {
  router.push({ name: 'chat-room', params: { roomId: v4() } })
}
</script>

<template>
  <main>
    <form @submit.prevent="onSubmit">
      <button id="create_room_button" type="submit">Create a new room</button>
    </form>
  </main>
</template>
