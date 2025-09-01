import WebsiteCrawler from "../websiteCrawler.js";

/*
    Website B is https://www.livescience.com/ This is a News Site that focuses on science/tech articles.
    It is a site that is commonly used by teachers meaning that there are more likely to be posts with comments (for participation). 
    It seems pretty rare for most blog posts to receive comments so hopefully this will add some variance to the data.

    Once of the things that is different with this site in particular is the amount of ads run.
    this makes sense are this site is a free news so ads is how they generate revenue where HEB obviously makes money on the groceries
    This adds a lot of bloat to the site via extra requests so I tried to shift away from waiting for requests as they were timing out
    instead opting for waiting for elements
*/

class WebsiteBScraper extends WebsiteCrawler {
    async getFirstArticle(){
        if (!this.page) throw new Error("Page not initialized. Call openNewPage first.")
        const article = await this.page.$('.article-link')
        if (!article) throw new Error("No article found");
        return article
    }

    async clickFirstArticle(){
        const article = await this.getFirstArticle()
        
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'networkidle2' }),
            article.click()
        ])
        await this.addWaitTime(1000,2000)
    }

    async getUrl () {
        if (!this.page) throw new Error("Page not initialized. Call openNewPage first.")
        const url = this.page.url();
        return url
    }

    async scrapeBySelector(selector) {
        if (!this.page) throw new Error("Page not initialized. Call openNewPage first.")
        const text = await this.page.evaluate((selector)=>{
            const item = document.querySelector(selector)
            console.log(selector)
            return item ? item.innerText : null;
        }, selector)
        return text
    }
    /*

    */
    async scrapeNumOfComments() {
        if (!this.page) throw new Error("Page not initialized. Call openNewPage first.");

        
        const count = await this.page.evaluate(() => {
            // only really used here but maybe we could throw this in a helper class or function
            const extractNumber = (el) => {
            if (!el) return null;
            const match = el.innerText.match(/\d+/); 
            return match ? match[0] : null;
            };
            /* 
                with the current state of the UI it seems to have two elements which flip depending on the state.
                when there are comments the number of comments will display '[x-show="showCount"]'
                when there are no comments as separate element will display  [x-show="!showCount"] defaulting to zero
                I wanted to check both of these rather than defaulting to zero when '[x-show="showCount"]' is not there
                since there is the possibility that they update this logic and I want to error handle for that
            */
            const elShown = document.querySelector('[x-show="showCount"]');
            const numberShown = extractNumber(elShown);
            if (numberShown !== null) return numberShown;

            const elHidden = document.querySelector('[x-show="!showCount"]');
            const numberHidden = extractNumber(elHidden);
            if (numberHidden !== null) return numberHidden;

            throw new Error("No numeric comment count found. Selector may have changed or element has no number.");
        });

        return count;
    }
}

export default WebsiteBScraper