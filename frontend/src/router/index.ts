import { createRouter, createWebHistory } from 'vue-router'
import { userStore } from '../stores/user'

import ChatRoomView from '../views/ChatRoomView.vue'
import LoginView from '../views/LoginView.vue'
import CreateRoomView from '../views/CreateRoomView.vue'

const requireUser = (to: any, from: any, next: any) => {
  if (!userStore.isLoggedIn)
    next({
      name: 'login',
      query: {
        redirect: to.fullPath
      }
    })
  else next()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/room/:roomId',
      name: 'chat-room',
      component: ChatRoomView,
      beforeEnter: requireUser
    },
    {
      path: '/create-room',
      name: 'create-room',
      component: CreateRoomView,
      beforeEnter: requireUser
    },

    {
      path: '/login',
      name: 'login',
      component: LoginView
    }
  ]
})

export default router
