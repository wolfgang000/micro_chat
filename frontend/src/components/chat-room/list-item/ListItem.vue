<script setup lang="ts">
import { type IMessage, type IChatListItem, ChatListItemType, type IChatEvent } from '@/models'
import MessageReceived from './MessageReceived.vue'
import MessageSent from './MessageSent.vue'
import GeneralEvent from './GeneralEvent.vue'

const props = defineProps<{
  item: IChatListItem
}>()
</script>

<template>
  <div v-if="item.type === ChatListItemType.MessageSent">
    <MessageSent :message="(item.meta as IMessage)" />
  </div>
  <div v-else-if="item.type === ChatListItemType.MessageReceived">
    <MessageReceived :message="(item.meta as IMessage)" />
  </div>
  <div v-else-if="item.type === ChatListItemType.ChatEvent">
    <GeneralEvent :item="(item.meta as IChatEvent)" />
  </div>
</template>
