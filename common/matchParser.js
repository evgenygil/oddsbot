const phantom = require('phantom');
const cheerio = require('cheerio');
const params = require('./config').phantomParams;
const fs = require('fs');


let matchLink = process.argv[2];

(async function() {

    const instance = await phantom.create(params);
    const page = await instance.createPage();
    await page.on('onResourceRequested', function(requestData) {
        // console.info('Requesting', requestData.url);
    });

    const ua = await page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
    const status = await page.open('http://oddsportal.com/soccer/usa/nwsl-women/houston-dash-orlando-pride-fR1xBV55/');
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

    console.log(match);
    await instance.exit();

})();