<script setup lang="ts">
import { ref } from 'vue'
import { socketConnection } from '../api'
import { useRouter, useRoute } from 'vue-router'
import { userStore } from '../stores/user'

const username = ref('')
const router = useRouter()
const route = useRoute()

const onSubmit = () => {
  socketConnection
    .connect({ username: username.value })
    .then(() => {
      console.log('connected!')
      userStore.setUsername(username.value)
      userStore.setIsLoggedIn(true)

      if (route.query.redirect) {
        router.push({ path: route.query.redirect as string })
      } else {
        router.push({ name: 'create-room' })
      }
    })
    .catch(() => console.log('unable to connect!'))
}
</script>

<template>
  <main>
    <div>
      <form @submit.prevent="onSubmit">
        <input v-model="username" required />
        <button type="submit">Login</button>
      </form>
    </div>
  </main>
</template>
