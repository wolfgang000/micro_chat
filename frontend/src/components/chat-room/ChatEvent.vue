<script setup lang="ts">
import { type IChatListItem } from '@/models'
import { computed } from 'vue'
import dateFormat from 'dateformat'
import ChatEvent from './ChatEvent.vue'
import ChatMessageReceived from './ChatMessageReceived.vue'
import ChatMessageSent from './ChatMessageSent.vue'

const props = defineProps<{
  item: IChatListItem
}>()

const doesMessageBelongToCurrentUser = computed(() => {
  return props.message.username === userStore.username
})
const formattedDate = computed(() => {
  return dateFormat(props.message.created_at, 'dddd, mmmm d, yyyy | h:MM TT')
})
</script>

<template>
  <div
    class="msg-container mx-1"
    :class="{
      'flex-row-reverse': doesMessageBelongToCurrentUser,
      'flex-row': !doesMessageBelongToCurrentUser
    }"
  >
    <div
      class="flex-column"
      :class="{
        'msg-sent': doesMessageBelongToCurrentUser,
        'msg-received': !doesMessageBelongToCurrentUser
      }"
    >
      <div class="body-container">
        <div class="p-2">
          <div>{{ message.body }}</div>
        </div>
      </div>
      <span class="time_date"
        ><strong>{{ props.message.username }}</strong> | {{ formattedDate }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.msg-container {
  display: block;
  margin-bottom: 1rem;
}

.time_date {
  color: #747474;
  font-size: 12px;
  margin: 8px;
  align-self: inherit;
}

/*********************/

.msg-sent {
  display: flex;
  padding-right: 1%;
  padding-left: 15%;
  align-self: flex-end;
  width: 100%;
}

.msg-sent .body-container {
  font-family: 'Proxima Nova Regular', sans-serif;
  background: #46468c;
  border-radius: 7px;
  font-size: 14px;
  color: #fff;
  align-self: inherit;
}

/*********************/

.msg-received {
  display: flex;
  padding-left: 1%;
  padding-right: 15%;
  align-self: flex-start;
  width: 100%;
}

.msg-received .body-container {
  font-family: 'Proxima Nova Regular', sans-serif;
  background: #eaeaea;
  border-radius: 7px;
  color: #545454;
  font-size: 14px;
  align-self: inherit;
}
</style>
