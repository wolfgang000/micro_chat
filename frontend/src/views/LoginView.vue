<script setup lang="ts">
import { ref } from 'vue'
import { socketConnection } from '../api'
import { useRouter, useRoute } from 'vue-router'
import { userStore } from '../stores/user'

const LOCAL_STORAGE_USERNAME_KEY = 'username'

const localStorageUsername = localStorage.getItem(LOCAL_STORAGE_USERNAME_KEY)

const username = ref(localStorageUsername || '')
const rememberMeCheck = ref(Boolean(localStorageUsername))

const router = useRouter()
const route = useRoute()

const onSubmit = () => {
  socketConnection
    .connect({ username: username.value })
    .then(() => {
      //Todo: add a debug logger here
      userStore.setUsername(username.value)
      userStore.setIsLoggedIn(true)
      if (rememberMeCheck.value) {
        localStorage.setItem(LOCAL_STORAGE_USERNAME_KEY, username.value)
      }

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
    <div class="container router-view-container">
      <div class="card">
        <div class="card-body">
          <form @submit.prevent="onSubmit">
            <div class="mb-3">
              <label for="username_field" class="form-label">Username</label>
              <input class="form-control" id="username_field" v-model="username" required />
            </div>
            <div class="mb-3">
              <div class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  v-model="rememberMeCheck"
                  id="remember_me_checkbox"
                />
                <label class="form-check-label" for="remember_me_checkbox">
                  Remember my username
                </label>
              </div>
            </div>
            <div class="d-grid gap-2">
              <button class="btn btn-primary" id="login_button" type="submit">Join</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.router-view-container {
  margin-top: 60px;
}
</style>
