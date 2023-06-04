<script setup lang="ts">
import { type IChatEvent } from '@/models'

const props = defineProps<{
  item: IChatEvent
}>()
</script>

<template>
  <div class="d-flex flex-column mx-1 msg-container" style="text-align: center">
    <div class="">
      <div class="body-container d-inline-flex">
        <div class="p-2">
          <div>{{ item.body }}</div>
        </div>
      </div>
    </div>
    <span class="time_date"> {{ item.created_at }} </span>
  </div>
</template>

<style scoped>
.msg-container {
  display: block;
  margin-bottom: 1rem;
  text-align: center;
}

.time_date {
  color: #747474;
  font-size: 12px;
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

.body-container {
  font-family: 'Proxima Nova Regular', sans-serif;
  background: #eaeaea;
  border-radius: 7px;
  color: #545454;
  font-size: 14px;
}
</style>
