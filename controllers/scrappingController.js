const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

const positiveWords = [
    'joy', 'enriching', 'positive', 'best', 'success',
    'happy', 'beneficial', 'rewarding', 'prosperous',
    'advantageous', 'bright', 'favorable', 'delightful',
    'blissful', 'pleasing', 'uplifting', 'inspirational',
    'glorious', 'euphoric', 'outstanding'
];

const negativeWords = [
    'challenge', 'difficult', 'negative', 'worst', 'failure',
    'sad', 'detrimental', 'disadvantageous', 'grim',
    'unfavorable', 'harsh', 'regrettable', 'painful',
    'distressing', 'upsetting', 'dismal', 'depressing',
    'woeful', 'dire', 'troubling'
];

const analyzeSentiment = (text) => {
    let positiveCount = 0;
    let negativeCount = 0;

    for (let word of positiveWords) {
        positiveCount += (text.match(new RegExp(word, 'gi')) || []).length;
    }

    for (let word of negativeWords) {
        negativeCount += (text.match(new RegExp(word, 'gi')) || []).length;
    }

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
}

exports.scrapeWebsite = async (req, res) => {
    // const url = 'https://wsa-test.vercel.app;
    const url = req.body.url;

    if (!url) {
        return res.status(400).json({ error: 'URL is not provided' });
    }
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });

        const content = await page.content();
        const $ = cheerio.load(content);

        const articles = [];

        $('main > div > div > div > div').each((i, elem) => {
            if (i > 1) {
                const title = $(elem).find('div a').contents().filter((index, content) => {
                    return content.type === 'text';
                }).text().trim();
                const image = url + $(elem).find('div a img').attr('src');
                const href = url + $(elem).find('div a').attr('href');
                const description = $(elem).find('div.group div:nth-child(2)').text().trim();
                const date = $(elem).find('div time').text().trim();

                const sentiment_analysis = analyzeSentiment(description);
                articles.push({ title, description, sentiment_analysis, image, href, date });
            }
        });

        await browser.close();

        res.json(articles);
    } catch (error) {
        res.status(500).json({ error: 'Failed to scrape website' });
    }
};
