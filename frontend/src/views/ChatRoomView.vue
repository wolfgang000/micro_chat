<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'

interface Message {
  msg: string
  created_at: string
  username: string
}

const message = ref('')
const messages = ref([] as Message[])

const route = useRoute()
const roomId = route.params.roomId
const channelName = `room:${roomId}`
const channel = socketConnection.getOrCreateChannel(channelName)

channel.on('server.new_message', (message: Message) => {
  messages.value.push(message)
})

channel
  .join()
  .receive('ok', (resp: any): void => {
    console.log('Joined successfully', resp)
  })
  .receive('error', (resp: any): void => {
    // TODO: handle failure
    console.log('Unable to join', resp)
  })

onUnmounted(() => {
  socketConnection.deleteChannel(channelName)
})

const onSubmit = () => {
  channel.push('client.new_message', { msg: message.value })
  message.value = ''
}
</script>

<template>
  <main>
    <div>
      <div id="message_list">
        <div v-for="message in messages">
          {{ message.msg }}
        </div>
      </div>
      <form @submit.prevent="onSubmit">
        <input id="msg_field" v-model="message" required />
        <button id="send_msg_button" type="submit">Send</button>
      </form>
    </div>
  </main>
</template>
