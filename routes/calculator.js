const express = require('express');
const router = express.Router();
const parser = require('../common/parser');

router.get('/', function (req, res, next) {
    res.render('calculator/index', {

    });
});


router.get('/getleagues', function (req, res, next) {
    (async () => {

        let matches =  await parser.parseLeagues('html');

        res.send(matches);

    })();
});


module.exports = router;
