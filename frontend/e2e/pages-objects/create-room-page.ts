import { expect, Locator, Page } from '@playwright/test'

export class CreateRoomPage {
  readonly page: Page
  readonly pagePath = '/create-room'
  readonly createRoomButton: Locator

  constructor(page: Page) {
    this.page = page
    this.createRoomButton = page.locator('#create_room_button')
  }

  async goto() {
    await this.page.goto(this.pagePath)
  }

  async validateCurrentUrl() {
    await this.page.waitForURL(/\/create-room/)
  }

  async createRoom() {
    await expect(this.createRoomButton).toBeVisible()
    await this.createRoomButton.click()
  }
}
