const phantom = require('phantom');
const cheerio = require('cheerio');
const config = require('./common/config');
const baseUrl = 'http://oddsportal.com';
const cp = require('child_process');
const _ = require('underscore');
const puppeteer = require('puppeteer');

// let matchLink = req.body.link;
let matchLink = 'http://www.oddsportal.com/soccer/world/club-friendly/admira-concordia-lAC2z3ft/';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));


(async () => {
    const browser = await puppeteer.launch({
        timeout: 0,
        args: config.pupArgs
    });
    const page = await browser.newPage();
    await browser.userAgent(config.userAgent);
    await page.setViewport({width: 1440, height: 960});
    await page.goto(matchLink);
    let content = await page.evaluate(() => document.body.innerHTML);

    let $ = await cheerio.load(content);

    let match = await getMatchData($);

    if (match.pinnacle.hint) {
        console.log('pinnacle: '+ match.pinnacle.hint);
        await page.hover('div[onmouseover="' + match.pinnacle.hint + '"]').catch((e) => console.log(e.stack));
        await page.waitFor(500);
        await page.screenshot({path: '1.png'});
        match.pinnacle.blob = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
    }

    if (match.marathonbet.hint) {
        console.log('marathonbet: '+ match.marathonbet.hint);
        await page.hover('div[onmouseover="' + match.marathonbet.hint + '"]').catch((e) => console.log(e.stack));
        await page.waitFor(1000);
        await page.screenshot({path: '2.png'});
        match.marathonbet.blob = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
    }

    await browser.close();

    console.log(match);

})();

function getMatchData($) {
    return new Promise(function (resolve, reject) {

        if ($) {
            let match = {
                title: $('div#col-content > h1').text(),
                pinnacle: {
                    odds: [],
                },
                marathonbet: {
                    odds: [],
                }
            };

            $('div#odds-data-table')
                .find('table.table-main.detail-odds.sortable')
                .find('tbody')
                .find('a.name2')
                .each(function (index, element) {
                    if ((element.attribs.href).includes('pinnacle')) {
                        let divS = $(element).parent().parent().parent().find('td.right.odds > div');
                        divS.each(function (i, e) {
                            match.pinnacle.odds.push($(e).text());
                        });
                        match.pinnacle.odds.splice(1, 1);
                        let min = _.indexOf(match.pinnacle.odds, _.min(match.pinnacle.odds));

                        divS.splice(1, 1);
                        match.pinnacle.hint = divS[min].attribs.onmouseover;

                    }
                    if ((element.attribs.href).includes('marathonbet')) {
                        let divS = $(element).parent().parent().parent().find('td.right.odds > div');
                        divS.each(function (i, e) {
                            match.marathonbet.odds.push($(e).text());
                        });

                        match.marathonbet.odds.splice(1, 1);
                        let min = _.indexOf(match.marathonbet.odds, _.min(match.marathonbet.odds));

                        divS.splice(1, 1);
                        match.marathonbet.hint = divS[min].attribs.onmouseover;

                    }
                });
            resolve(match)
        }
        else {
            reject('error')
        }
    });
}
