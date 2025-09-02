import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

puppeteer.use(StealthPlugin());

class WebsiteCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async openBrowser(options = {}) {
    try {
      this.browser = await puppeteer.launch({
        headless: false, // switch back when in prod
        timeout: 10000,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-blink-features=AutomationControlled",
          "--disable-infobars",
          "--window-size=1280,1200",
        ],
        ...options,
      });
      return this.browser;
    } catch (e) {
      console.error("Failed to launch browser:", e.message);
      throw new Error(
        "Could not open browser. Check Puppeteer installation or launch options.",
      );
    }
  }

  async openNewPage() {
    try {
      if (!this.browser)
        throw new Error("Browser not started. Call openBrowser first.");
      this.page = await this.browser.newPage();

      // I got blocked so I had to try to appear more like a real user
      await this.page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
          "AppleWebKit/537.36 (KHTML, like Gecko) " +
          "Chrome/123.0.0.0 Safari/537.36",
      );

      await this.page.setViewport({ width: 1280, height: 1200 });

      await this.page.setExtraHTTPHeaders({
        "accept-language": "en-US,en;q=0.9",
      });
      return this.page;
    } catch (e) {
      console.error("Failed to open a new page:", e.message);
      throw new Error("Could not open a new page in the browser.");
    }
  }

  async addWaitTime(min = 500, max = 1500) {
    if (!this.page)
      throw new Error("Page not initialized. Call openNewPage first.");

    if (min > max) [min, max] = [max, min]; // swap if needed
    const waitTime = min + Math.random() * (max - min);
    await new Promise((resolve) => setTimeout(resolve, waitTime));
  }

  async goToPage(
    url,
    maxRetries = 2,
    waitForSelector = null,
    waitOptions = { timeout: 10000 },
  ) {
    if (!this.page)
      throw new Error("Page not initialized. Call openNewPage first.");

    let attempt = 0;
    while (attempt < maxRetries) {
      try {
        await this.page.goto(url, waitOptions);
        console.log(`Navigated to ${url}`);

        // Optional element wait for selector I added this because of the news site
        if (waitForSelector) {
          await this.page.waitForSelector(waitForSelector, waitOptions);
        }

        await this.addWaitTime();
        return;
      } catch (error) {
        attempt++;
        console.error(
          `Failed to navigate to ${url} (attempt ${attempt}):`,
          error.message,
        );

        if (attempt >= maxRetries) {
          throw new Error(
            `Navigation to ${url} failed after ${maxRetries} attempts.`,
          );
        }

        const backoffTime = 1000 * Math.pow(2, attempt);
        console.log(`Retrying in ${backoffTime / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, backoffTime));
      }
    }
  }

  async closeBrowser() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
      }
    } catch (e) {
      console.error("Error closing browser:", e.message);
    }
  }
}

export default WebsiteCrawler;
