import { expect, Locator, Page } from '@playwright/test'

export class ChatRoomPage {
  readonly page: Page
  readonly pagePath = '/room'

  constructor(page: Page) {
    this.page = page
  }

  async goto(roomId: string) {
    await this.page.goto(`${this.pagePath}/${roomId}`)
  }

  async validateCurrentUrl() {
    await this.page.waitForURL(/\/room\/\w+/)
  }
}
