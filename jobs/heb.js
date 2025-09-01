import WebsiteAScraper from "../webScrapers/WebsiteAScraper.js";
import writeJSON from "../nodeJsHelpers/writeFile.js";
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

async function runHebJob(products) {
    const scraper = new WebsiteAScraper();
    try {
        const allProducts = []
        await scraper.openBrowser()
        await scraper.openNewPage()
        await scraper.goToPage('https://www.heb.com/')
        // we loop through all products then loop through each card that contains the data we want to scrape
        for (let product of products) {
            await scraper.search(product);
            const title = await scraper.getPageTitle()
            const productArray = {[product]: []}
            const cards = await scraper.getAllProductCards()
            for (let card of cards){
                const cardDetails = await scraper.getCardDetails(card)
                cardDetails.title = title
                productArray[product].push(cardDetails)
            }
            allProducts.push(productArray)
        }
        
        // write to file with our data (I choose to use es6 for imports which made file editing more verbose) maybe this could be put in a helper function to clean up
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = dirname(__filename);
        const outputPath = resolve(__dirname, '../output/heb.json');
        await writeJSON(outputPath, allProducts)
    } catch (e) {
        console.error("Error in runHebJob:", e)
    } finally {
        if (scraper) {await scraper.closeBrowser()}
    }
}

export default runHebJob;
