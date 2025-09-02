import WebsiteBScraper from "../webScrapers/WebsiteBScraper.js";
import writeJSON from "../nodeJsHelpers/writeFile.js";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

async function runNewsJob() {
  const scraper = new WebsiteBScraper();
  try {
    await scraper.openBrowser();
    await scraper.openNewPage();
    await scraper.goToPage("https://www.livescience.com/news", 2, "h1", {
      timeout: 30000,
    });
    await scraper.addWaitTime(3000, 4000);
    await scraper.clickFirstArticle();
    const url = await scraper.getUrl();
    console.log(url);
    const title = await scraper.scrapeBySelector("h1");
    const author = await scraper.scrapeBySelector('[rel="author"]');
    const numOfComments = await scraper.scrapeNumOfComments();
    const articleInfo = { url, title, author, numOfComments };

    //write to file with our data (I choose to use es6 for imports which made file editing more verbose) maybe this could be put in a helper function to clean up
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const outputPath = resolve(__dirname, "../output/news.json");
    await writeJSON(outputPath, articleInfo);
  } catch (e) {
    console.error("Error in runNewsJob:", e);
  } finally {
    if (scraper) {
      await scraper.closeBrowser();
    }
  }
}

export default runNewsJob;
