import { test, expect } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'
import { v4 } from 'uuid'

test('Send a message to chat room', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const chatRoomPage = new ChatRoomPage(page)
  const roomId = v4()

  await chatRoomPage.goto(roomId)
  await loginPage.performLogin('user-1')
  await chatRoomPage.validateCurrentUrl()
  await page.context().grantPermissions(['camera', 'microphone'])
  await chatRoomPage.startCallButton.click()
  await expect(chatRoomPage.currentUserVideoElement).toBeVisible()
})
