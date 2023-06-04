<script setup lang="ts">
import { type IMessage, type IChatListItem, ChatListItemType, type IChatEvent } from '@/models'
import { computed } from 'vue'
import GeneralEvent from './GeneralEvent.vue'
import ChatMessageReceived from './ChatMessageReceived.vue'
import ChatMessageSent from './ChatMessageSent.vue'

const props = defineProps<{
  item: IChatListItem
}>()
</script>

<template>
  <div v-if="item.type === ChatListItemType.MessageSent">
    <ChatMessageSent :message="(item.meta as IMessage)" />
  </div>
  <div v-else-if="item.type === ChatListItemType.MessageReceived">
    <ChatMessageReceived :message="(item.meta as IMessage)" />
  </div>
  <div v-else-if="item.type === ChatListItemType.ChatEvent">
    <GeneralEvent :item="(item.meta as IChatEvent)" />
  </div>
</template>
