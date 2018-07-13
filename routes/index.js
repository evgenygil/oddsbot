const express = require('express');
const router = express.Router();const phantom = require('phantom');
const cheerio = require('cheerio');
const config = require('../common/config');
const baseUrl = 'http://oddsportal.com';
const _ = require('underscore');
const puppeteer = require('puppeteer');


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '<oddsbot>'});
});

router.get('/loadallmatches2', function (req, res, next) {

    (async () => {

        const browser = await puppeteer.launch({
            timeout: 0,
            args: config.pupArgs
        });

        const page = await browser.newPage();
        await browser.userAgent(config.userAgent);
        await page.setViewport({width: 1440, height: 960});
        await page.goto('http://oddsportal.com/matches/soccer/');
        let content = await page.evaluate(() => document.body.innerHTML);

        let $ = await cheerio.load(content);

        let linksUl = await getMatches($);

        await browser.close();

        res.send(linksUl);

    })();

});

router.post('/getmatch2', function (req, res, next) {

    let matchLink = req.body.link;
    // let matchLink = 'http://www.oddsportal.com/soccer/world/club-friendly/admira-concordia-lAC2z3ft/';

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
            await page.hover('div[onmouseover="' + match.pinnacle.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(200);
            match.pinnacle.blob = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
        }

        if (match.marathonbet.hint) {
            await page.hover('div[onmouseover="' + match.marathonbet.hint + '"]').catch((e) => console.log(e.stack));
            await page.waitFor(500);
            match.marathonbet.blob = await page.evaluate(() => ('<div class="hint-block">' + document.querySelector('#tooltiptext').outerHTML + '</div>'));
        }

        await browser.close();

        res.send(match);

    })();

});

function getMatches($) {
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

function getMatchData($) {
    return new Promise(function (resolve, reject) {

        if ($) {
            let match = {
                title: $('div#col-content > h1').text(),
                pinnacle: {
                    odds: [],
                    hint: false,
                },
                marathonbet: {
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


// router.post('/getmatch', function (req, res, next) {
//
//     let matchLink = req.body.link;
//
//     (async function() {
//
//         const instance = await phantom.create(config.phantomParams);
//         const page = await instance.createPage();
//         await page.on('onResourceRequested', function(requestData) {
//             // console.info('Requesting', requestData.url);
//         });
//
//         const ua = await page.setting('userAgent', config.userAgent);
//         const scr = await page.setting('viewportSize', {width: 1024, height: 768});
//         const status = await page.open(matchLink);
//         const content = await page.property('content');
//
//         let $ = cheerio.load(content);
//
//         let match = {
//             title: $('div#col-content > h1').text(),
//             pinnacle : {
//                 odds: [],
//                 hintcode: ''
//             },
//             marathonbet : {
//                 odds: [],
//                 hintcode: ''
//             }
//         };
//
//         $('div#odds-data-table')
//             .find('table.table-main.detail-odds.sortable')
//             .find('tbody')
//             .find('a.name2')
//             .each(function (index, element) {
//                 if ((element.attribs.href).includes('pinnacle')) {
//                     let divS = $(element).parent().parent().parent().find('td.right.odds > div');
//                     divS.each(function (i, e) {
//                         match.pinnacle.odds.push($(e).text());
//                     });
//                     match.pinnacle.odds.splice(1, 1);
//                     let min = _.indexOf(match.pinnacle.odds, _.min(match.pinnacle.odds));
//
//                     divS.splice(1, 1);
//                     console.dir(divS[0]);
//                     match.pinnacle.hintcode = divS[min].attribs.onmouseover.match(/\(([^)]+)\)/)[1].split(',')[2];
//
//                     page.sendEvent('click', divS[0].offsetLeft, divS[0].offsetTop, 'left');
//
//                 }
//                 if ((element.attribs.href).includes('marathonbet')) {
//                     let divS = $(element).parent().parent().parent().find('td.right.odds > div');
//                     divS.each(function (i, e) {
//                         match.marathonbet.odds.push($(e).text());
//                     });
//
//                     match.marathonbet.odds.splice(1, 1);
//                     let min = _.indexOf(match.marathonbet.odds, _.min(match.marathonbet.odds));
//
//                     divS.splice(1, 1);
//                     match.marathonbet.hintcode = divS[min].attribs.onmouseover.match(/\(([^)]+)\)/)[1].split(',')[2];
//
//                 }
//             });
//
//         await instance.exit();
//         await res.send(match);
//
//     })();
//
// });
// router.get('/loadallmatches', function (req, res, next) {
//     (async function() {
//
//         let objects = [];
//
//         const instance = await phantom.create(config.phantomParams);
//         const page = await instance.createPage();
//         await page.on('onResourceRequested', function(requestData) {
//             console.info('Requesting', requestData.url);
//         });
//
//         const ua = await page.setting('userAgent', config.userAgent);
//         const status = await page.open('http://oddsportal.com/matches/soccer/');
//         const content = await page.property('content');
//
//         let $ = cheerio.load(content);
//         let linksArr = [];
//         let linksUl = '<ul style="list-style-type: none; font-size: 10px" id="links-list">';
//
//         $('#table-matches').find('td.name.table-participant > a').each((index, element) => {
//             let href = element.attribs.href;
//             if (href.includes('/soccer/')) {
//                 linksArr.push(href);
//                 linksUl += '<li>' + baseUrl + href + '</li>';
//             }
//         });
//
//         linksUl += '</ul>';
//
//         await instance.exit();
//         await res.send(linksUl);
//
//     })();
//
// });

module.exports = router;
