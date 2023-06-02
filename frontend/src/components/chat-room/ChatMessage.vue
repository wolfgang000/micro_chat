<script setup lang="ts">
import { type IMessage } from '@/models'

const props = defineProps<{
  message: IMessage
}>()
</script>

<template>{{ message.msg }}</template>

<style scoped></style>
