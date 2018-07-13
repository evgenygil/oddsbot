const phantom = require('phantom');
const cheerio = require('cheerio');
const config = require('./common/config');
const baseUrl = 'http://oddsportal.com';
const cp = require('child_process');
const _ = require('underscore');
const puppeteer = require('puppeteer');

// let matchLink = req.body.link;
let matchLink = 'http://www.oddsportal.com/soccer/world/club-friendly/san-carlos-guadalupe-xnsUg7zB/';

(async () => {
    const browser = await puppeteer.launch({
        args: [
            '--proxy-server=46.101.167.43:80', // Or whatever the address is
        ]
    });
    const page = await browser.newPage();
    await browser.userAgent(config.userAgent);
    await page.setViewport({width: 1440, height: 960});
    await page.goto(matchLink);
    let content = await page.evaluate(() => document.body.innerHTML);

    // let $ = await cheerio.load(content);

    // let k = $('div#odds-data-table');

    let k = await page.evaluate(() => document.querySelector('a.name[href="/bookmaker/marathonbet/link/"]').closest('td').closest('tr'));

    let $ = await cheerio.load(k);

    // let k = $('div#odds-data-table')
    //     .find('a.name[href="/bookmaker/marathonbet/link/"]');

    // const data = await page.evaluate(() => {
    //     const tds = Array.from(document.querySelector('a.name[href="/bookmaker/marathonbet/link/"]').closest('td').closest('tr td').innerHTML)
    //     return tds.map(td => td.textContent)
    // });
    // let divs = await page.evaluate(() => document.querySelector('div#odds-data-table').querySelector('tbody').innerHTML);

    // await page.hover("div[onmouseover=\"page.hist(this,'P-0.00-0-0','355svxv464x0x7omg8',381,event,0,1)\"]");
    // await page.screenshot({path: 'example.png'});

    // let content = await page.evaluate(() => document.querySelector('#tooltiptext').outerHTML);

    $('body').find('td').each(function (index, element) {
        console.log(element);
    });

    await browser.close();

})();