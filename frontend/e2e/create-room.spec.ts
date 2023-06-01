import { test } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'
import { CreateRoomPage } from './pages-objects/create-room-page'

test('Create chat room', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const chatRoomPage = new ChatRoomPage(page)
  const createRoomPage = new CreateRoomPage(page)

  await createRoomPage.goto()
  await loginPage.performLogin('user-1')

  await createRoomPage.validateCurrentUrl()
  await createRoomPage.createRoom()

  await chatRoomPage.validateCurrentUrl()
})
