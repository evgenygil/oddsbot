let express = require('express');
let router = express.Router();
const phantom = require('phantom');
const cheerio = require('cheerio');
var webPage = require('webpage');


const proxy = ["--proxy=223.93.172.248:3128"/*, "--proxy-type=http"*/];


/* GET home page. */
router.get('/', function (req, res, next) {

    (async function() {
        const instance = await phantom.create(proxy);
        const page = await instance.createPage();
        await page.on('onResourceRequested', function(requestData) {
            console.info('Requesting', requestData.url);
        });

        const ua = await page.setting('userAgent', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.256');
        const status = await page.open('http://oddsportal.com/matches/soccer/');
        const content = await page.property('content');
        console.log(content);

        await instance.exit();
    })();

});


module.exports = router;
