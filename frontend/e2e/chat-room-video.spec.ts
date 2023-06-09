import { test, expect, Browser } from '@playwright/test'
import { v4 } from 'uuid'
import { createChatRoomPageAndLogin } from './util'

test('Start video call and wait for participants to join', async ({ browser }) => {
  const roomId = v4()
  const { page: page, chatRoomPage: chatRoomPage } = await createChatRoomPageAndLogin(
    browser,
    'user-1',
    roomId
  )

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
  const { page: pageUserWolf, chatRoomPage: chatRoomPageUserWolf } =
    await createChatRoomPageAndLogin(browser, 'UserWolf', roomId)
  // Start call from UserWolf's tab
  await chatRoomPageUserWolf.startCallButton.click()

  // UserDog
  const { page: pageUserDog, chatRoomPage: chatRoomPageUserDog } = await createChatRoomPageAndLogin(
    browser,
    'UserDog',
    roomId
  )

  // Check in Call Indicator
  // ---------------------------------------------------
  await expect(chatRoomPageUserDog.inCallIndicatorContainer).not.toContainText('UserDog')
  await expect(chatRoomPageUserDog.inCallIndicatorContainer).toContainText('UserWolf')
  // ---------------------------------------------------
  // Check in Call and Join Buttons
  // ---------------------------------------------------
  await expect(chatRoomPageUserDog.startCallButton).not.toBeVisible()
  await expect(chatRoomPageUserDog.joinCallButton).not.toBeDisabled()
  // ---------------------------------------------------
  // Join
  await chatRoomPageUserDog.joinCallButton.click()
  // ---------------------------------------------------
  // Check in Call Indicator again
  await expect(chatRoomPageUserDog.inCallIndicatorContainer).toContainText('UserDog')
  // ---------------------------------------------------
  // Check UserWolf video element on UserDog tab
  // ---------------------------------------------------
  const peerVideoElements = await chatRoomPageUserDog.remoteUserVideoElements
  const peerVideoElementsCount = await peerVideoElements.count()
  expect(peerVideoElementsCount).toBe(1) // only one peer
  for (let i = 0; i < peerVideoElementsCount; i++) {
    await expect(peerVideoElements.nth(i)).toBeVisible()
    // wait for mocked webcam video to loaded
    await pageUserWolf.waitForTimeout(500)
    const currentUserVideoElementCurrentTime = await peerVideoElements
      .nth(i)
      .evaluate((e: HTMLVideoElement) => {
        return (e as HTMLVideoElement).currentTime
      })
    // Check if the video element is streaming the peer's mocked webcam
    expect(currentUserVideoElementCurrentTime).toBeGreaterThan(0)
  }
  // ---------------------------------------------------
  // Check remote UserDog video element on UserWolf tab
  // ---------------------------------------------------
  const peersVideoElementsWolf = await chatRoomPageUserWolf.remoteUserVideoElements
  const peerUserVideoElementsCountWolf = await peersVideoElementsWolf.count()
  expect(peerVideoElementsCount).toBe(1) // only one peer
  for (let i = 0; i < peerUserVideoElementsCountWolf; i++) {
    await expect(peersVideoElementsWolf.nth(i)).toBeVisible()
    // wait for mocked webcam video to loaded
    await pageUserWolf.waitForTimeout(500)
    const currentUserVideoElementCurrentTime = await peersVideoElementsWolf
      .nth(i)
      .evaluate((e: HTMLVideoElement) => {
        return (e as HTMLVideoElement).currentTime
      })
    expect(currentUserVideoElementCurrentTime).toBeGreaterThan(0)
  }
})
