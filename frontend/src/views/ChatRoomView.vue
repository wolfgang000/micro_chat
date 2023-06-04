<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { socketConnection } from '../api'
import { useRoute } from 'vue-router'
import { ChatListItemType } from '@/models'
import type { IMessage, IChatListItem } from '@/models'
import { Presence } from 'phoenix'
import { userStore } from '@/stores/user'

import ChatMessage from '@/components/chat-room/list-item/ListItem.vue'
import dateFormat from 'dateformat'

let presences = {}
const message = ref('')
const listItems = ref([] as IChatListItem[])

const route = useRoute()
const roomId = route.params.roomId
const channelName = `room:${roomId}`
const channel = socketConnection.getOrCreateChannel(channelName)

channel.on('server.new_message', (message: IMessage) => {
  message.created_at = dateFormat(message.created_at, 'dddd, mmmm d, yyyy | h:MM TT')

  const itemType =
    message.username === userStore.username
      ? ChatListItemType.MessageSent
      : ChatListItemType.MessageReceived

  listItems.value.unshift({ type: itemType, meta: message })
})

let onJoin = (id: any, current: any, newPres: any) => {
  if (!current) {
    listItems.value.unshift({
      type: ChatListItemType.ChatEvent,
      meta: {
        body: `${newPres.metas[0].username} has join the room`,
        created_at: dateFormat(Date(), 'dddd, mmmm d, yyyy | h:MM TT')
      }
    })

    console.log('user has entered for the first time', newPres)
  } else {
    console.log('user additional presence', newPres)
  }
}
// detect if user has left from all tabs/devices, or is still present
let onLeave = (id: any, current: any, leftPres: any) => {
  if (current.metas.length === 0) {
    listItems.value.unshift({
      type: ChatListItemType.ChatEvent,
      meta: {
        body: `${leftPres.metas[0].username} has left the room`,
        created_at: dateFormat(Date(), 'dddd, mmmm d, yyyy | h:MM TT')
      }
    })

    console.log('user has left from all devices', leftPres)
  } else {
    console.log('user left from a device', leftPres)
  }
}

channel.on('presence_state', (state) => {
  console.log('state')
  console.log(state)
  presences = Presence.syncState(presences, state)
  // console.log('presence_state')
  // console.log(presences)
})

channel.on('presence_diff', (diff) => {
  // console.log('diff')
  // console.log(diff)
  presences = Presence.syncDiff(presences, diff, onJoin, onLeave)
  // console.log('presence_diff')
  // Presence.list(presences, (id, data) => {
  //   console.log(id)
  //   console.log(data)

  //   return null
  // })
  // console.log(presences)
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
  channel.push('client.new_message', { body: message.value })
  message.value = ''
}
</script>

<template>
  <div class="chat-room-main-container d-flex flex-column" style="height: 100vh">
    <div id="message_list" class="msg_history d-flex flex-column-reverse">
      <ChatMessage v-for="(item, index) in listItems" v-bind:key="index" :item="item" />
    </div>
    <form @submit.prevent="onSubmit">
      <div class="input-group mb-3 px-3">
        <input
          id="msg_field"
          type="text"
          class="form-control"
          placeholder="Message"
          v-model="message"
          aria-describedby="send_msg_button"
          required
        />
        <button id="send_msg_button" class="btn btn-primary" type="submit">Send</button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.chat-room-main-container {
  background: #f7f9fa;
}
.msg_history {
  height: 100%;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(226, 221, 221, 0.8);
}

::-webkit-scrollbar-thumb {
  border-radius: 10px;
  background: rgb(255, 255, 255, 0.8);
  -webkit-box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.3);
}
</style>
