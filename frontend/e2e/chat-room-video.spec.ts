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
  await expect(chatRoomPage.startCallButton).not.toBeVisible()
  await expect(chatRoomPage.joinCallButton).toBeDisabled()
  await expect(chatRoomPage.inCallIndicatorContainer).toContainText('user-1')
})

test('Join an already started call', async ({ browser }) => {
  const contextUserWolf = await browser.newContext()
  const pageUserWolf = await contextUserWolf.newPage()
  const loginPageUserWolf = new LoginPage(pageUserWolf)
  const chatRoomPageUserWolf = new ChatRoomPage(pageUserWolf)

  const contextUserDog = await browser.newContext()
  const pageUserDog = await contextUserDog.newPage()
  const loginPageUserDog = new LoginPage(pageUserDog)
  const chatRoomPageUserDog = new ChatRoomPage(pageUserDog)

  const roomId = v4()

  // ---------------------------------------------------
  //Login and redirect UserWolf to chat room
  await chatRoomPageUserWolf.goto(roomId)
  await loginPageUserWolf.performLogin('UserWolf')
  await chatRoomPageUserWolf.startCallButton.click()

  // ---------------------------------------------------
  await chatRoomPageUserDog.goto(roomId)
  await loginPageUserDog.performLogin('UserDog')
  await expect(chatRoomPageUserDog.inCallIndicatorContainer).not.toContainText('UserDog')
  await expect(chatRoomPageUserDog.inCallIndicatorContainer).toContainText('UserWolf')
  await expect(chatRoomPageUserDog.startCallButton).not.toBeVisible()
  await expect(chatRoomPageUserDog.joinCallButton).not.toBeDisabled()
  await chatRoomPageUserDog.joinCallButton.click()
  await expect(chatRoomPageUserDog.currentUserVideoElement).toBeVisible()
  // wait for mocked webcam video to loaded
  await pageUserDog.waitForTimeout(10)
  const currentUserVideoElementCurrentTime =
    await chatRoomPageUserDog.currentUserVideoElement.evaluate((e: HTMLVideoElement) => {
      return (e as HTMLVideoElement).currentTime
    })
  expect(currentUserVideoElementCurrentTime).toBeGreaterThan(0)
  await expect(chatRoomPageUserDog.joinCallButton).toBeDisabled()
  await expect(chatRoomPageUserDog.inCallIndicatorContainer).toContainText('UserDog')
})
