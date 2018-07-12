const express = require('express');
const router = express.Router();const phantom = require('phantom');
const cheerio = require('cheerio');
const config = require('../common/config');
const baseUrl = 'http://oddsportal.com';
const cp = require('child_process');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('index', {title: '<oddsbot>'});
});

router.get('/loadallmatches', function (req, res, next) {
    (async function() {

        let objects = [];

        const instance = await phantom.create(config.phantomParams);
        const page = await instance.createPage();
        await page.on('onResourceRequested', function(requestData) {
            console.info('Requesting', requestData.url);
        });

        const ua = await page.setting('userAgent', config.userAgent);
        const status = await page.open('http://oddsportal.com/matches/soccer/');
        const content = await page.property('content');

        let $ = cheerio.load(content);
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

        await instance.exit();
        await res.send(linksUl);

    })();

});

router.post('/getmatch', function (req, res, next) {

    let matchLink = req.body.link;

    (async function() {

        const instance = await phantom.create(config.phantomParams);
        const page = await instance.createPage();
        await page.on('onResourceRequested', function(requestData) {
            // console.info('Requesting', requestData.url);
        });

        const ua = await page.setting('userAgent', config.userAgent);
        const status = await page.open(matchLink);
        const content = await page.property('content');

        let $ = cheerio.load(content);

        let match = {
            title: $('div#col-content > h1').text(),
            pinnacle : {
                odds: []
            },
            marathonbet : {
                odds: []
            }
        };

        $('div#odds-data-table')
            .find('table.table-main.detail-odds.sortable')
            .find('tbody')
            .find('a.name2')
            .each(function (index, element) {
                if ((element.attribs.href).includes('pinnacle')) {
                    $(element).parent().parent().parent().find('td.right.odds > div').each(function (i, e) {
                        match.pinnacle.odds.push($(e).text());
                    });
                }
                if ((element.attribs.href).includes('marathonbet')) {
                    $(element).parent().parent().parent().find('td.right.odds > div').each(function (i, e) {
                        match.marathonbet.odds.push($(e).text());
                    });
                }
            });

        await instance.exit();
        await res.send(match);

    })();

});

module.exports = router;
