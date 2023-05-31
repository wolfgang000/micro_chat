import { createRouter, createWebHistory } from 'vue-router'
import { userStore } from '../stores/user'

import HomeView from '../views/HomeView.vue'
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
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/room',
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
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
