<script setup lang="ts">
import { type IMessage } from '@/models'

const props = defineProps<{
  message: IMessage
}>()
</script>

<template>
  <div class="msg-container mx-1 flex-row">
    <div class="flex-column msg-received">
      <div class="body-container">
        <div class="p-2">
          <div>{{ message.body }}</div>
        </div>
      </div>
      <span class="time_date"
        ><strong>{{ props.message.username }}</strong> | {{ props.message.created_at }}
      </span>
    </div>
  </div>
</template>

<style scoped>
@import './base.css';

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
