import { test, expect } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'
import { v4 } from 'uuid'

test('Login with valid user name', async ({ page }) => {
  await page.goto('/')
  const username = v4()
  const loginPage = new LoginPage(page)
  await loginPage.validateCurrentUrl()
  await loginPage.performLogin(username)

  await expect(await loginPage.loginButton).not.toBeVisible()
  await page.waitForURL('**/create-room')
})

test('Try to login with invalid username(empty field)', async ({ page }) => {
  await page.goto('/')
  const loginPage = new LoginPage(page)
  await loginPage.performLogin('')
  await expect(await loginPage.loginButton).toBeVisible()
  await loginPage.validateCurrentUrl()
})

test('Login and redirect to existing room', async ({ page }) => {
  const loginPage = new LoginPage(page)
  const chatRoomPage = new ChatRoomPage(page)
  // Go to to chat room but redirect to login
  await chatRoomPage.goto(v4())
  await loginPage.validateCurrentUrl()
  await loginPage.performLogin(v4())

  // Redirect to room after login
  await chatRoomPage.validateCurrentUrl()
})
