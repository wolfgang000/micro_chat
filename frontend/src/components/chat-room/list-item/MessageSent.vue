<script setup lang="ts">
import { type IMessage } from '@/models'

const props = defineProps<{
  message: IMessage
}>()
</script>

<template>
  <div class="msg-container mx-1 flex-row-reverse">
    <div class="flex-column msg-sent">
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
</style>
