<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { socketConnection } from '../api'

const message = ref('')

const submitMessage = () => {
  socketConnection.connect({ username: 'test' })

  // let channel = socket.channel('room:42', {})
  // channel
  //   .join()
  //   .receive('ok', (resp: any): void => {
  //     console.log('Joined successfully', resp)
  //   })
  //   .receive('error', (resp: any): void => {
  //     console.log('Unable to join', resp)
  //   })
}
</script>

<template>
  <main>
    <div>
      <p>Message is: {{ message }}</p>
      <input v-model="message" />
      <button @click="submitMessage">Send</button>
    </div>
  </main>
</template>
