import { expect, Locator, Page } from '@playwright/test'

export class ChatRoomPage {
  readonly page: Page
  readonly pagePath = '/room'
  readonly messageListContainer: Locator
  readonly messageField: Locator
  readonly sendMessageButton: Locator
  readonly membersOnlineButton: Locator
  readonly membersOnlineModal: Locator
  readonly typingIndicatorContainer: Locator
  //------
  readonly startCallButton: Locator
  readonly currentUserVideoElement: Locator
  readonly joinCallButton: Locator
  readonly inCallIndicatorContainer: Locator

  constructor(page: Page) {
    this.page = page
    this.messageListContainer = page.locator('#message_list')
    this.messageField = page.locator('#msg_field')
    this.sendMessageButton = page.locator('#send_msg_button')
    this.membersOnlineButton = page.locator('#membersOnlinebutton')
    this.membersOnlineModal = page.locator('#membersOnlineModal')
    this.typingIndicatorContainer = page.locator('#typingIndicatorContainer')
    this.startCallButton = page.locator('#startCallButton')
    this.currentUserVideoElement = page.locator('#currentUserVideoElement')
    this.joinCallButton = page.locator('#joinCallButton')
    this.inCallIndicatorContainer = page.locator('#InCallIndicatorContainer')
  }

  async goto(roomId: string) {
    await this.page.goto(`${this.pagePath}/${roomId}`)
  }

  async validateCurrentUrl() {
    await expect(this.sendMessageButton).toBeVisible()
    await this.page.waitForURL(/\/room\/\w+/)
  }

  async sendMessage(message: string) {
    await expect(this.messageField).toBeVisible()
    await expect(this.sendMessageButton).toBeVisible()
    await this.messageField.fill(message)
    await this.sendMessageButton.click()
  }

  async openMembersOnlineModal() {
    await expect(this.membersOnlineModal).not.toBeVisible()
    await expect(this.membersOnlineButton).toBeVisible()
    await this.membersOnlineButton.click()
    await expect(this.membersOnlineModal).toBeVisible()
  }
}
