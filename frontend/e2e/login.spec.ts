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

test("login with 'Remember my username' option", async ({ context }) => {
  const username = v4()

  const firstSession = await context.newPage()
  await firstSession.goto('/')
  const loginPage1 = new LoginPage(firstSession)
  const chatRoomPage1 = new ChatRoomPage(firstSession)
  await expect(await loginPage1.rememberMeCheckbox.isChecked()).toBeFalsy()
  await loginPage1.rememberMeCheckbox.check()
  await expect(await loginPage1.rememberMeCheckbox.isChecked()).toBeTruthy()
  await loginPage1.performLogin(username)

  //-------------------------

  const secondSession = await context.newPage()
  await secondSession.goto('/')
  const loginPage2 = new LoginPage(secondSession)
  await expect(await loginPage2.rememberMeCheckbox.isChecked()).toBeTruthy()
  await expect(await loginPage2.usernameField.inputValue()).toBe(username)
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
