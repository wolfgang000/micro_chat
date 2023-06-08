import { test, expect } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'
import { v4 } from 'uuid'

test('Start video call and wait for participants to join', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const chatRoomPage = new ChatRoomPage(page)
  const roomId = v4()

  await chatRoomPage.goto(roomId)
  await loginPage.performLogin('user-1')
  await chatRoomPage.validateCurrentUrl()
  await chatRoomPage.startCallButton.click()
  await expect(chatRoomPage.currentUserVideoElement).toBeVisible()
  // wait for mocked webcam video to loaded
  await page.waitForTimeout(10)
  const currentUserVideoElementCurrentTime = await chatRoomPage.currentUserVideoElement.evaluate(
    (e: HTMLVideoElement) => {
      return (e as HTMLVideoElement).currentTime
    }
  )
  expect(currentUserVideoElementCurrentTime).toBeGreaterThan(0)
})
