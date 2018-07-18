const cheerio = require('cheerio');
const _ = require('underscore');
const puppeteer = require('puppeteer');
const config = require('./config');
const html2json = require('html2json').html2json;

const baseUrl = config.baseUrl;


async function parseMatches(type = 'json') {

    let linksUl;

    const browser = await puppeteer.launch({
        timeout: 0,
        args: config.pupArgs
    });

    const page = await browser.newPage();
    await browser.userAgent(config.userAgent);
    await page.setViewport({width: 1440, height: 960});
    await page.goto(config.soccerUrl);
    let content = await page.evaluate(() => document.body.innerHTML);

    let $ = await cheerio.load(content);

    switch (type) {
        case 'html':
            linksUl = await getMatchesHTML($);
            break; // return in html for monitor page
        case 'json':
        default:
            linksUl = await getMatchesJSON($);
            break; // return in json for storing
    }

    await browser.close();

    return linksUl;

}

async function parseMatch(matchLink, type = 'json', log = false) {

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

    let timeInterval = (log) ? 1800 : 10800;

    if (match.pinnacle.odds.length > 0 && (Date.parse(match.date) - (Date.now()) < timeInterval)) {

        if (match.pinnacle.hint) {
            await page.hover('div[onmouseover="' + match.pinnacle.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(300);
            let pinacle = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
            match.pinnacle.blob = await getJsonFromHtml(pinacle);
        }

        if (match.marathonbet.hint) {
            await page.hover('div[onmouseover="' + match.marathonbet.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(600);
            let marathonbet = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
            match.marathonbet.blob = await getJsonFromHtml(marathonbet);
        }
        if (match.xbet.hint) {
            await page.hover('div[onmouseover="' + match.xbet.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(900);
            let xbet = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
            match.xbet.blob = await getJsonFromHtml(xbet);
        }

        await browser.close();

        return match;
    } else {
        return null;
    }
}


function getMatchesHTML($) {
    return new Promise(function (resolve, reject) {

        if ($) {
            let linksArr = [];
            let linksUl = '<ul style="list-style-type: none; font-size: 10px" id="links-list">';

            $('#table-matches').find('td.name.table-participant > a').each((index, element) => {
                let href = element.attribs.href;
                if (href.includes('/soccer/')) {
                    linksArr.push(href);
                    linksUl += '<li>' + baseUrl + href + '</li>';
                }
            });

            linksUl += '</ul>';

            resolve(linksUl)
        }
        else {
            reject('error')
        }
    });
}

function getMatchesJSON($) {
    return new Promise(function (resolve, reject) {

        if ($) {

            let entity = {
                title: 'Soccer',
                links: []
            };

            $('#table-matches').find('td.name.table-participant > a').each((index, element) => {
                let href = element.attribs.href;
                if (href.includes('/soccer/')) {
                    entity.links.push(href);
                }
            });

            resolve(entity)
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
                            console.log('Element: ' + element);
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
                            console.log('Element: ' + element);

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
                            console.log(e.stack);
                            console.log('Error in hint ' + divS);
                            console.log('Element: ' + element);

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