const phantom = require('phantom');
const cheerio = require('cheerio');
const config = require('./common/config');
const baseUrl = 'http://oddsportal.com';
const cp = require('child_process');


(async function() {
    console.log('Wait please nigga... Do not rush!');

    const instance = await phantom.create(config.phantomParams);
    const page = await instance.createPage();
    await page.on('onResourceRequested', function(requestData) {
        // console.info('Requesting', requestData.url);
    });

    const ua = await page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
    const status = await page.open('http://oddsportal.com/matches/soccer/');
    const content = await page.property('content');

    let $ = cheerio.load(content);
    let linksArr = [];

    $('#table-matches').find('td.name.table-participant > a').each((index, element) => {
        let href = element.attribs.href;
        if (href.includes('/soccer/')) {
            linksArr.push(href);
        }
    });

    console.log(linksArr);

    for (let i = 0; i < 3; i++) {
        setTimeout(function () {
            let child = cp.fork('matchParser.js', [baseUrl + linksArr[i]], {silent: true});
            child.stderr.on('data', function(data) {
                console.log('stdout: ' + data);
            });
            child.on('message', function(msg) {
                console.log(require('util').inspect(msg));
            });
        }, 1000 * i);
    }

    await instance.exit();
})();