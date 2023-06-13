import { reactive } from 'vue'

export const userStore = reactive({
  isLoggedIn: false,
  username: '',
  userId: '',
  setIsLoggedIn(value: boolean) {
    this.isLoggedIn = value
  },
  setUsername(value: string) {
    this.username = value
  }
})
