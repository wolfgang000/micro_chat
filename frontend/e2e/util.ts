import { Browser } from '@playwright/test'
import { LoginPage } from './pages-objects/login-page'
import { ChatRoomPage } from './pages-objects/chat-room-page'

export const createChatRoomPageAndLogin = async (
  browser: Browser,
  username: string,
  roomId: string
) => {
  const contextUser = await browser.newContext()
  const pageUser = await contextUser.newPage()
  const loginPageUser = new LoginPage(pageUser)
  const chatRoomPage = new ChatRoomPage(pageUser)
  await chatRoomPage.goto(roomId)
  await loginPageUser.performLogin(username)
  await chatRoomPage.validateCurrentUrl()

  return { page: pageUser, chatRoomPage: chatRoomPage }
}
