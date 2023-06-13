<script setup lang="ts">
import MessageList from './messages/MessageList.vue'
import TypingIndicator from './messages/TypingIndicator.vue'
import InCallIndicator from './messages/InCallIndicator.vue'
import InputBox from './messages/InputBox.vue'
</script>

<template>
  <InCallIndicator />
  <MessageList />
  <TypingIndicator />
  <InputBox />
</template>

<style scoped></style>
