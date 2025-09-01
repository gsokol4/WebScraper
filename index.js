import runHebJob from './jobs/heb.js';
import runNewsJob from './jobs/news.js';

const args = process.argv.slice(2);
const jobType = args[0] || 'all';
const productsArg = args[1] || 'coffee grounds,almond milk' // comma-separated products to search for 
const products = productsArg ? productsArg.split(',') : [];

async function main() {
    switch (jobType.toLowerCase()) {
        case 'heb':
            console.log('Running HEB job...');
            await runHebJob(products);
            break;
        case 'news':
            console.log('Running News job...');
            await runNewsJob();
            break;
        case 'all':
            console.log('Running all jobs...');
            await runHebJob(products);
            await runNewsJob();
            break;
        default:
            console.log(`Unknown job type: ${jobType}. Valid options are: heb, news, all.`);
    }
}

main();