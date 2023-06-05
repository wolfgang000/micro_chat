import { expect, Locator, Page } from '@playwright/test'

export class CreateRoomPage {
  readonly page: Page
  readonly pagePath = '/create-room'
  readonly createRoomButton: Locator
  readonly createRoomToast: Locator
  readonly goToRoomLink: Locator
  readonly copyRoomLinkButton: Locator

  constructor(page: Page) {
    this.page = page
    this.createRoomButton = page.locator('#create_room_button')
    this.createRoomToast = page.locator('#create_room_toast')
    this.goToRoomLink = page.locator('#go_to_room_link')
    this.copyRoomLinkButton = page.locator('#copy_room_link_button')
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
