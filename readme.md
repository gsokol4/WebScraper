Web Scraper Project

To: Dekel Barzilay and Nandakumar Subramaniam

This project implements a modular and extensible web scraping framework using Node.js (18+) and Puppeteer. The goal was not only to meet the scraping requirements, but also to build a structure that anticipates scalability, maintainability, and resilience against site restrictions.

Setup and Requirements

Node.js 18+ is required (due to ES6 imports).
Check your version:

node -v

Install dependencies before running:

npm install

Running the Jobs

By default, running the index file will execute all available jobs:

node index.js

You may also run jobs individually:

HEB (Website A)

node index.js heb

Optionally, provide a list of products:

node index.js heb "fettuccine pasta, carrots"

This will return up to 60 product listings per search term, making it possible to calculate costs for meals or compare prices.

Live Science (Website B)

node index.js news

This fetches details of the latest article from Live Science
.

All results are written as JSON files into the /output folder.
Currently, files overwrite on each run, but a production setup could store results in a database such as MongoDB or DynamoDB for persistence and query flexibility.

File Structure

index.js – Entry point for the project. All jobs start here.

/jobs – Workflow scripts. Each job has its own workflow, making it easy to expand with new scrapers.

/nodeJsHelpers – Shared utility logic (e.g., file writing). Clean separation keeps database/file I/O abstracted.

/webScrapers – Scraper classes implementing the requirements from requirements.txt.

WebsiteCrawler: Base class with openBrowser, goToPage, closeBrowser.

WebsiteAScraper: Scrapes HEB (product titles, prices, and search support).

WebsiteBScraper: Scrapes Live Science (author, title, comment counts).

Sample outputs are included in /output as reference.

Websites Scraped
Website A – HEB Grocery (https://www.heb.com/
)

HEB is a Texas-based grocery chain with stores across major Texas metro areas and online delivery. Scraping their product data enables analysis such as:

Comparing cost of living between Texas metro regions.

Identifying best value products (by price per weight), something not directly available in their UI.

Website B – Live Science (https://www.livescience.com/
)

A science and technology news site
Notable challenge: high ad volume generates excess network requests. To avoid Puppeteer timeouts, scraping relies more on element presence than waitForNetworkIdle.

Scalability and Anti-Throttling Considerations

During testing, HEB successfully detected automated scraping behavior and began throttling requests after ~5 queries per hour. This was not an IP ban (personal browser-based requests still worked), but rather bot-detection.

Mitigations already attempted:

Puppeteer Stealth plugin.

Custom request headers mimicking real browsers.

Randomized wait times.

Potential future work for scalability:

Rotating residential IPs/proxies to distribute requests.

Simulated user interaction (mouse movement, varied browser fingerprints).

Session management to reduce repeated logins/searches.

Distributed job queues if scaling horizontally across multiple machines.

This structure ensures the project can grow from a prototype into a production-ready system capable of handling higher volumes of scraping while staying resilient against throttling mechanisms.

Requirements Implemented

Base WebsiteCrawler with openBrowser, goToPage, closeBrowser.

Child scrapers with methods for extracting required details.

Jobs that orchestrate scrapers and output structured JSON.

Error handling and logging included.

Future enhancements could include:

Pagination support for HEB search results.

Retry logic on transient failures.

Automated unit tests for scraper classes.
