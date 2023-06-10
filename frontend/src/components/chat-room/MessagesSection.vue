<script setup lang="ts">
import MessageList from './messages/MessageList.vue'
import TypingIndicator from './messages/TypingIndicator.vue'
import InCallIndicator from './messages/InCallIndicator.vue'
import InputBox from './messages/InputBox.vue'
</script>

<template>
  <div class="messages-section-container d-flex flex-column">
    <InCallIndicator />
    <MessageList />
    <TypingIndicator />
    <InputBox />
  </div>
</template>

<style scoped>
.messages-section-container {
  background: #f7f9fa;
  height: 100%;
  width: 100%;
}
</style>
