const express = require('express');
const router = express.Router();
const parser = require('../common/parser');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('monitor/index', {title: 'Online monitor'});
});

router.get('/loadallmatches', function (req, res, next) {

    (async () => {

        let matches =  await parser.parseMatches('html');

        res.send(matches);

    })();

});

router.post('/getmatch', function (req, res, next) {

    let matchLink = req.body.link;

    (async () => {

        let match =  await parser.parseMatch(matchLink);

        if (match) {

            // let delta_pin = (match.pinnacle.blob) ? match.pinnacle.blob.items[0].val - match.pinnacle.blob.items[match.pinnacle.blob.items.length - 1].val : 0;
            let delta_pin = (match.pinnacle.blob) ? match.pinnacle.blob.items[0].val - match.pinnacle.blob.openOdds.val : 0;
            let delta_xbet = (match.xbet.blob) ? match.xbet.blob.items[0].val - match.xbet.blob.openOdds.val : 0;
            let delta_mar = (match.marathonbet.blob) ? match.marathonbet.blob.items[0].val - match.marathonbet.blob.openOdds.val : 0;

            let varDate = Date.parse(match.date);
            let now = new Date();

            if ((delta_pin >= 0.09 || delta_xbet >=0.09 || delta_mar >= 0.09) /*&& ((varDate - now) < 10800) && (varDate > now)*/) {
                match.pinnacle.delta = Math.round(delta_pin * 100) / 100;
                match.xbet.delta = Math.round(delta_xbet * 100) / 100;
                match.marathonbet.delta = Math.round(delta_mar * 100) / 100;
                return res.send(match);
            }
        }

        return res.end();

    })();

});


module.exports = router;
