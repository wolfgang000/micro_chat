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

  await expect(chatRoomPage.messageListContainer).toContainText('user-1 has join the room')
  await chatRoomPage.sendMessage('a-message-from-user-1')
  await expect(chatRoomPage.messageField).toBeEmpty()
  await expect(chatRoomPage.messageListContainer).toContainText('a-message-from-user-1')
})

test('Send messages from 2 different users', async ({ browser }) => {
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
  await chatRoomPageUserWolf.validateCurrentUrl()

  //Login and redirect UserDog to chat room
  await chatRoomPageUserDog.goto(roomId)
  await loginPageUserDog.performLogin('UserDog')
  await chatRoomPageUserDog.validateCurrentUrl()
  // ---------------------------------------------------
  //Send message from UserWolf
  await chatRoomPageUserWolf.sendMessage('a-message-from-user-wolf')
  await expect(chatRoomPageUserWolf.messageListContainer).toContainText('a-message-from-user-wolf')
  await expect(chatRoomPageUserDog.messageListContainer).toContainText('a-message-from-user-wolf')

  //Send message from UserDog
  await chatRoomPageUserDog.sendMessage('a-message-from-user-dog')
  await expect(chatRoomPageUserWolf.messageListContainer).toContainText('a-message-from-user-dog')
  await expect(chatRoomPageUserDog.messageListContainer).toContainText('a-message-from-user-dog')
})

test('Check user presence(join and leave messages)', async ({ browser }) => {
  const contextUserWolf = await browser.newContext()
  const pageUserWolf = await contextUserWolf.newPage()
  const loginPageUserWolf = new LoginPage(pageUserWolf)
  const chatRoomPageUserWolf = new ChatRoomPage(pageUserWolf)

  const contextUserDog = await browser.newContext()
  const pageUserDog = await contextUserDog.newPage()
  const loginPageUserDog = new LoginPage(pageUserDog)
  const chatRoomPageUserDog = new ChatRoomPage(pageUserDog)

  const roomId = v4()

  // Check join messages
  // ---------------------------------------------------
  // Check UserWolf join message
  await chatRoomPageUserWolf.goto(roomId)
  await loginPageUserWolf.performLogin('UserWolf')
  await chatRoomPageUserWolf.validateCurrentUrl()
  await expect(chatRoomPageUserWolf.messageListContainer).toContainText(
    'UserWolf has join the room'
  )

  // Check UserDog join message
  await chatRoomPageUserDog.goto(roomId)
  await loginPageUserDog.performLogin('UserDog')
  await chatRoomPageUserDog.validateCurrentUrl()
  await expect(chatRoomPageUserDog.messageListContainer).toContainText('UserDog has join the room')

  // Check UserDog join message on UserWolf's tab
  await expect(chatRoomPageUserWolf.messageListContainer).toContainText('UserDog has join the room')
  // ---------------------------------------------------

  // Check leave messages
  // ---------------------------------------------------
  // Close UserWolf tab
  await contextUserWolf.close()

  // Check UserWolf leave message on UserDog's tab
  await expect(chatRoomPageUserDog.messageListContainer).toContainText('UserWolf has left the room')
  // ---------------------------------------------------
})

test('Check user presence(members online counter)', async ({ browser }) => {
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
  // Check UserWolf members online counter
  await chatRoomPageUserWolf.goto(roomId)
  await loginPageUserWolf.performLogin('UserWolf')
  await chatRoomPageUserWolf.validateCurrentUrl()
  await expect(chatRoomPageUserWolf.membersOnlineButton).toContainText('1 Members online')

  // Check UserDog members online counter
  await chatRoomPageUserDog.goto(roomId)
  await loginPageUserDog.performLogin('UserDog')
  await chatRoomPageUserDog.validateCurrentUrl()
  await expect(chatRoomPageUserDog.membersOnlineButton).toContainText('2 Members online')

  // ---------------------------------------------------
  // Close UserWolf tab
  await contextUserWolf.close()

  // Check UserDog members online counter after UserWolf departure
  await expect(chatRoomPageUserDog.membersOnlineButton).toContainText('1 Members online')
  // ---------------------------------------------------
})

test('Check user presence(members online modal)', async ({ browser }) => {
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
  // Check UserWolf members online modal
  await chatRoomPageUserWolf.goto(roomId)
  await loginPageUserWolf.performLogin('UserWolf')
  await chatRoomPageUserWolf.validateCurrentUrl()
  await chatRoomPageUserWolf.openMembersOnlineModal()
  await expect(chatRoomPageUserWolf.membersOnlineModal).toContainText('UserWolf')

  // Check UserWolf members online modal
  await chatRoomPageUserDog.goto(roomId)
  await loginPageUserDog.performLogin('UserDog')
  await chatRoomPageUserDog.validateCurrentUrl()
  await chatRoomPageUserDog.openMembersOnlineModal()
  await expect(chatRoomPageUserDog.membersOnlineModal).toContainText('UserDog')
  await expect(chatRoomPageUserDog.membersOnlineModal).toContainText('UserWolf')
  // Check UserDog presence on UserWolf's tab
  await expect(chatRoomPageUserDog.membersOnlineModal).toContainText('UserDog')

  // ---------------------------------------------------
  // Close UserWolf tab
  await contextUserWolf.close()
  // Check UserDog members online after UserWolf departure
  await expect(chatRoomPageUserDog.membersOnlineModal).not.toContainText('UserWolf')
  // ---------------------------------------------------
})
