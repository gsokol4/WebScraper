import WebsiteBScraper from "../webScrapers/WebsiteBScraper.js";
import writeJSON from "../nodeJsHelpers/writeFile.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

async function runNewsJob() {
    const scraper = new WebsiteAScraper();
    try {
        const allArticles = []
        await scraper.openBrowser();
        await scraper.openNewPage();
        await scraper.goToPage('https://www.livescience.com/');
        
        
        
        //write to file with our data (I choose to use es6 for imports which made file editing more verbose) maybe this could be put in a helper function to clean up
        const __filename = fileURLToPath(import.meta.url);
        const __dirname = dirname(__filename);
        const outputPath = resolve(__dirname, '../output/news.json');
        await writeJSON(outputPath, allProducts)
    } catch (e) {
        console.error("Error in runHebJob:", e);
    } finally {
        if (scraper) {await scraper.closeBrowser()}
    }
}

export default runNewsJob;
