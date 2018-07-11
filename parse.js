const phantom = require('phantom');
const cheerio = require('cheerio');
const proxy = ["--proxy=80.150.65.6:8080"/*, "--proxy-type=http"*/];

(async function() {
    const instance = await phantom.create(proxy);
    const page = await instance.createPage();
    await page.on('onResourceRequested', function(requestData) {
        console.info('Requesting', requestData.url);
    });

    const ua = await page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
    const status = await page.open('http://oddsportal.com/matches/soccer/');
    const content = await page.property('content');

    let $ = cheerio.load(content);

    console.log($('#table-matches').children().html());

    await instance.exit();
})();