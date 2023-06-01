import { expect, Locator, Page } from '@playwright/test'

export class LoginPage {
  readonly page: Page
  readonly usernameField: Locator
  readonly loginButton: Locator
  readonly pagePath = '/login'

  constructor(page: Page) {
    this.page = page
    this.usernameField = page.locator('#username_field')
    this.loginButton = page.locator('#login_button')
  }

  async goto() {
    await this.page.goto(this.pagePath)
  }

  async validateCurrentUrl() {
    await this.page.waitForURL(/login/)
  }

  async performLogin(username: string) {
    await expect(this.usernameField).toBeVisible()
    await expect(this.loginButton).toBeVisible()
    await this.usernameField.fill(username)
    await this.loginButton.click()
  }
}
