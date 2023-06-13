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
  await expect(chatRoomPage.startCallButton).not.toBeVisible()
  await expect(chatRoomPage.leaveCallButton).toBeVisible()
  await expect(chatRoomPage.inCallIndicatorContainer).toContainText('user-1')
})

test('Start video call and then leave', async ({ browser }) => {
  const roomId = v4()
  const { page: page, chatRoomPage: chatRoomPage } = await createChatRoomPageAndLogin(
    browser,
    'user-1',
    roomId
  )

  await chatRoomPage.startCallButton.click()
  await expect(chatRoomPage.inCallIndicatorContainer).toContainText('user-1')
  // ---------------------------------------------------
  await chatRoomPage.leaveCallButton.click()
  await expect(chatRoomPage.inCallIndicatorContainer).not.toBeVisible()
  await expect(chatRoomPage.startCallButton).toBeVisible()
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
})

test('Join a call and leave', async ({ browser }) => {
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

  // ---------------------------------------------------
  // UserDog Joins
  await chatRoomPageUserDog.joinCallButton.click()
  // ---------------------------------------------------
  // UserDog Leaves
  // ---------------------------------------------------
  await chatRoomPageUserDog.leaveCallButton.click()
  // ---------------------------------------------------
  // Check UserWolf tab again
  // ---------------------------------------------------
  await expect(chatRoomPageUserWolf.inCallIndicatorContainer).not.toContainText('UserDog')
})
