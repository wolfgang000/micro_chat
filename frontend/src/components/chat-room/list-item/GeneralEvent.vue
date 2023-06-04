<script setup lang="ts">
import { type IChatEvent } from '@/models'

const props = defineProps<{
  item: IChatEvent
}>()
</script>

<template>
  <div class="d-flex flex-column mx-1 msg-container">
    <div class="">
      <div class="body-container d-inline-flex">
        <div class="p-2">
          <div>{{ item.body }}</div>
        </div>
      </div>
    </div>
    <span class="time-date"> {{ item.created_at }} </span>
  </div>
</template>

<style scoped>
.msg-container {
  display: block;
  margin-bottom: 1rem;
  text-align: center;
}

.time-date {
  color: #747474;
  font-size: 12px;
}

.body-container {
  background: #eaeaea;
  border-radius: 7px;
  color: #545454;
  font-size: 14px;
}
</style>
