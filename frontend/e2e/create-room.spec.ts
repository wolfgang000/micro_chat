import { test, expect } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'
import { CreateRoomPage } from './pages-objects/create-room-page'

test('Create chat room and use goToRoomLink', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const chatRoomPage = new ChatRoomPage(page)
  const createRoomPage = new CreateRoomPage(page)

  await createRoomPage.goto()
  await loginPage.performLogin('user-1')

  await createRoomPage.validateCurrentUrl()
  await createRoomPage.createRoom()
  await createRoomPage.goToRoomLink.click()
  await chatRoomPage.validateCurrentUrl()
})

test('Copy to link to clickboard', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const createRoomPage = new CreateRoomPage(page)

  await createRoomPage.goto()
  await loginPage.performLogin('user-1')
  await createRoomPage.validateCurrentUrl()
  await createRoomPage.createRoom()
  await createRoomPage.copyRoomLinkButton.click()
  await expect(createRoomPage.createRoomToast).toBeVisible()
  // No way for the moment to check the clipboard's content using playwright
  // also the clipboard is a little buggy on CI, uncomment on a future playwright version
  // await expect(createRoomPage.createRoomToast).toContainText('Copied')
})
