import WebsiteCrawler from "../websiteCrawler.js";

/*
    Website A is https://www.heb.com/ This is a Grocery store. HEB Stands for "Here everything is better" 
    This is a Texas Grocer originally from San Antonio that has seen great success in the Texas market. The Grocer
    has a chain of stores in the major metro areas of Dallas, Houston, San Antonio and Austin.
    They also deliver Groceries. This puts them as unique site to scrape for pricing of common goods.
    Some types of analysis that can be done with data from scaping their site includes comparing const of living between different 
    metros/regions of the Texas Metros. Another interesting option is providing a list of most affordable products
    by weight as they ui provides this information but gives no option to sort by price/weight opting for total price leading to 
    small but expensive products dominating filtering by price in their own UI.
*/

class WebsiteAScraper extends WebsiteCrawler {
    async getSearchBar() {
        if (!this.page) throw new Error("Page not initialized. Call openNewPage first.");

        const searchBar = await this.page.$('[data-qe-id="searchBar"]')
        await this.addWaitTime()
        if (!searchBar) {
            throw new Error("Search bar not found on the page.")
        }
        
        return searchBar;
    }


    async clearSearch() {
        const searchBar = await this.getSearchBar();
        await searchBar.click({ clickCount: 3 }); 
        await this.addWaitTime()
        await this.page.keyboard.press('Backspace');
        await this.addWaitTime()
    }

    async typeInSearch(productToSearch){
        const searchBar = await this.getSearchBar()
        await searchBar.type(productToSearch, {delay: this.addWaitTime(300,400)})
        await this.addWaitTime()
    }

    async submitSearch() {
        const searchButton = await this.page.$('[data-qe-id="submitSearch"]')
        if (!searchButton) throw new Error("Search button not found on the page.")
        await this.addWaitTime()
        await searchButton.click();
        await this.addWaitTime()
    }

    async search(query) {
        await this.clearSearch()
        await this.typeInSearch(query);
        await this.submitSearch()
        // this waits for the page to load
        await this.page.waitForFunction(
            (query) => {
                const header = document.getElementById('searchGridHeader');
                return header && header.innerText.includes(query);
            },
            { timeout: 10000 },
            query
        );
    }

    async getPageTitle(){
        if (!this.page) throw new Error("Page not initialized. Call openNewPage first.")
        const title = await this.page.title();
        if(!title) throw new Error("Page Title not found on the page.")
        return await this.page.title();
    }

    async getAllProductCards() {
        let previousCount = 0;
        let cards = [];
            while (true) {
                // Scroll to the bottom of the page
                await this.page.evaluate(() => {
                    window.scrollBy(0, window.innerHeight);
                });

                // Wait for new items to load (network + render time)
                try {
                    await this.page.waitForNetworkIdle({ idleTime: 500, timeout: 5000 });
                } catch {
                    // If network idle times out, continue anyway
                }
                await this.addWaitTime(2000,3500); // small buffer

                // Count how many cards we have now
                cards = await this.page.$$('[data-component="product-card"]');
                const currentCount = cards.length;

                if (currentCount === previousCount) {
                    // No new cards appeared — we've reached the end
                    break;
                }

                previousCount = currentCount;
            }

        return cards;
    }

    // Get the product link from the card
    async getCardLink(card) {
        return await this.page.evaluate(card => {
            return card.querySelector('a')?.href || null;
        }, card);
    }

    // Get the product title
    async getCardTitle(card) {
        return await this.page.evaluate(card => {
            const titleEl = card.querySelector('[data-qe-id="productTitle"]');
            return titleEl?.innerText.trim() || null;
        }, card);
    }

    // Get the product price and unit price
    async getCardPrice(card) {
        return await this.page.evaluate(card => {
            const priceEl = card.querySelector('[data-qe-id="productPrice"]');
            if (!priceEl) return { price: null, unitPrice: null };

            const priceText = priceEl.innerText.trim();
            const [price, unitPrice] = priceText.split('/').map(p => p?.trim());
            return { price, unitPrice };
        }, card);
    }

    async getCardDetails(card) {
        const [link, title, { price, unitPrice }] = await Promise.all([
            this.getCardLink(card),
            this.getCardTitle(card),
            this.getCardPrice(card)
        ]);

        return { link, title, price, unitPrice };
    }

    
}

export default WebsiteAScraper