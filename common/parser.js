const cheerio = require('cheerio');
const _ = require('underscore');
const puppeteer = require('puppeteer');
const config = require('./config');
const html2json = require('html2json').html2json;
const logger = require('logger').createLogger('./logs/oddswork.log');

let Filter = require('../models/filter');

const baseUrl = config.baseUrl;

async function parseMatches() {

    const browser = await puppeteer.launch({
        timeout: 80000,
        args: config.pupArgs
    });

    const page = await browser.newPage();
    await browser.userAgent(config.userAgent);
    await page.setViewport({width: 1440, height: 960});
    await page.goto(config.soccerUrl).catch((e) => logger.error('Puppeteeer goto Error ',  e.stack));
    let content = await page.evaluate(() => document.body.innerHTML);

    let $ = await cheerio.load(content);

        let linksUl = await getMatches($).catch((e) => logger.error('getMatches Error ',  e.stack));

        let filteredUl = await procceedLinks(linksUl).catch((e) => logger.error('procceedLinks Error ',  e.stack));

    await browser.close();

    return filteredUl;

}

async function parseMatch(matchLink, type = 'json', log = false) {

    const browser = await puppeteer.launch({
        networkIdleTimeout: 80000,
        waitUntil: 'networkidle',
        timeout: 80000,
        args: config.pupArgs
    });
    const page = await browser.newPage();
    await browser.userAgent(config.userAgent);
    await page.setViewport({width: 1440, height: 960});
    await page.goto(matchLink);
    let content = await page.evaluate(() => document.body.innerHTML);

    let $ = await cheerio.load(content);

    let match = await getMatchData($).catch((e) => logger.error('getMatchData Error ',  e.stack));

    let timeInterval = (log) ? 1800 : 10800;

    if (match.pinnacle.odds.length > 0 && (Date.parse(match.date) - (Date.now()) < timeInterval)) {

        if (match.pinnacle.hint) {
            await page.hover('div[onmouseover="' + match.pinnacle.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(300);
            let pinacle = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>')).catch((e) => logger.error('evaluateHint Error ',  e.stack));
            match.pinnacle.blob = await getJsonFromHtml(pinacle).catch((e) => logger.error('getJsonFromHtml Error ',  e.stack));
        }

        if (match.marathonbet.hint) {
            await page.hover('div[onmouseover="' + match.marathonbet.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(600);
            let marathonbet = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>')).catch((e) => logger.error('evaluateHint Error ',  e.stack));
            match.marathonbet.blob = await getJsonFromHtml(marathonbet).catch((e) => logger.error('getJsonFromHtml Error ',  e.stack));
        }
        if (match.xbet.hint) {
            await page.hover('div[onmouseover="' + match.xbet.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(900);
            let xbet = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>')).catch((e) => logger.error('evaluateHint Error ',  e.stack));
            match.xbet.blob = await getJsonFromHtml(xbet).catch((e) => logger.error('getJsonFromHtml Error ',  e.stack));
        }

        await browser.close();

        return match;
    } else {
        return null;
    }
}

async function procceedLinks(linksUl) {

    let countries = await Filter.find({type: 1}).select('value').exec(); // country
    let leagues = await Filter.find({type: 2}).select('value').exec(); // league

    let countriesArr = await countries.map(function (e) {
        return e.value
    });
    let leaguesArr = await leagues.map(function (e) {
        return e.value
    });

    return await linksUl.filter(function (value) {
        let splitted = value.split('/');
        return ((countriesArr.indexOf(splitted[2]) < 0) && (leaguesArr.indexOf(splitted[3]) < 0));
    });

}


function getMatches($) {
    return new Promise(function (resolve, reject) {

        if ($) {

            let matches = [];

            $('#table-matches').find('td.name.table-participant > a').each((index, element) => {
                let href = element.attribs.href;
                if (href.includes('/soccer/')) {
                    matches.push(href);
                }
            });

            resolve(matches)
        }
        else {
            reject('error')
        }
    });
}

function getMatchData($) {
    return new Promise(function (resolve, reject) {

        if ($) {
            let match = {
                title: $('div#col-content > h1').text(),
                date: $('p.date').text(),
                pinnacle: {
                    odds: [],
                    hint: false,
                },
                marathonbet: {
                    odds: [],
                    hint: false,
                },
                xbet: {
                    odds: [],
                    hint: false,
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
                        try {
                            match.pinnacle.hint = divS[min].attribs.onmouseover;
                        } catch (e) {
                            console.log(e.stack);
                            console.log('Error in hint: ' + divS);
                            console.log('Element: ' + element.toString());
                        }
                    }
                    if ((element.attribs.href).includes('marathonbet')) {
                        let divS = $(element).parent().parent().parent().find('td.right.odds > div');
                        divS.each(function (i, e) {
                            match.marathonbet.odds.push($(e).text());
                        });

                        match.marathonbet.odds.splice(1, 1);
                        let min = _.indexOf(match.marathonbet.odds, _.min(match.marathonbet.odds));

                        divS.splice(1, 1);
                        try {
                            match.marathonbet.hint = divS[min].attribs.onmouseover;
                        } catch (e) {
                            console.log(e.stack);
                            console.log('Error in hint ' + divS);
                            console.log('Element: ' + element.toString());

                        }
                    }
                    if ((element.attribs.href).includes('1xbet')) {
                        let divS = $(element).parent().parent().parent().find('td.right.odds > div');
                        divS.each(function (i, e) {
                            match.xbet.odds.push($(e).text());
                        });

                        match.xbet.odds.splice(1, 1);
                        let min = _.indexOf(match.xbet.odds, _.min(match.xbet.odds));

                        divS.splice(1, 1);
                        try {
                            match.xbet.hint = divS[min].attribs.onmouseover;
                        } catch (e) {
                            logger.error('Error in hint ', e.stack);
                        }
                    }
                });
            resolve(match)
        }
        else {
            reject('error')
        }
    });
}

function getJsonFromHtml(data) {

    return new Promise(function (resolve, reject) {

        if (data) {

            data = data.split('<br>');

            data[0] = data[0].substring(data[0].indexOf('tooltiptext">') + 13);
            data.splice(-1, 1);

            let blob = {
                items: []
            };

            let maxIncrement = data.length - 3;

            for (let i = 0; i < maxIncrement; i++) {

                let val = html2json(data[i]);

                try {
                    let obj = {
                        date: val.child[0].text.trim().replace(',', ' ' + (new Date()).getFullYear() + ','),
                        val: val.child[1].child[0].text || val.child[1].text,
                        inc_dec: (val.child[3] !== undefined) ? val.child[3].child[0].text : 0
                    };

                    blob.items.push(obj);

                } catch (e) {
                    console.log(e.stack);
                    console.log('Error in obj parsing. Broken blob: ' + JSON.stringify(val));
                }

            }

            let odds = html2json(data[data.length - 1]);

            blob.openOdds = {
                date: odds.child[0].text.trim().replace(',', ' ' + (new Date()).getFullYear() + ','),
                val: odds.child[1].child[0].text
            };

            resolve(blob)
        }
        else {
            reject('error')
        }

    });

}

module.exports = {
    parseMatches: parseMatches,
    parseMatch: parseMatch,
};