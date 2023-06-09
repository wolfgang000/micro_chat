import { test, expect, Browser } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'
import { v4 } from 'uuid'

const createChatRoomPage = async (browser: Browser, username: string, roomId: string) => {
  const contextUser = await browser.newContext()
  const pageUser = await contextUser.newPage()
  const loginPageUser = new LoginPage(pageUser)
  const chatRoomPage = new ChatRoomPage(pageUser)
  await chatRoomPage.goto(roomId)
  await loginPageUser.performLogin(username)

  return { page: pageUser, chatRoomPage: chatRoomPage }
}

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
  const roomId = v4()
  // UserWolf
  const { page: pageUserWolf, chatRoomPage: chatRoomPageUserWolf } = await createChatRoomPage(
    browser,
    'UserWolf',
    roomId
  )
  // Start call from UserWolf's tab
  await chatRoomPageUserWolf.startCallButton.click()

  // UserDog
  const { page: pageUserDog, chatRoomPage: chatRoomPageUserDog } = await createChatRoomPage(
    browser,
    'UserDog',
    roomId
  )

  // ---------------------------------------------------
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

  // Check remote user video element on UserWolf tab
  // ---------------------------------------------------
  const remoteUserVideoElements = await chatRoomPageUserWolf.remoteUserVideoElements
  const remoteUserVideoElementsCount = await remoteUserVideoElements.count()
  for (let i = 0; i < remoteUserVideoElementsCount; i++) {
    await expect(remoteUserVideoElements.nth(i)).toBeVisible()
    // wait for mocked webcam video to loaded
    await pageUserWolf.waitForTimeout(500)
    const currentUserVideoElementCurrentTime = await remoteUserVideoElements
      .nth(i)
      .evaluate((e: HTMLVideoElement) => {
        return (e as HTMLVideoElement).currentTime
      })
    expect(currentUserVideoElementCurrentTime).toBeGreaterThan(0)
  }
})
