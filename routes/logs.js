const express = require('express');
const router = express.Router();
const moment = require('moment');
const logger = require('logger').createLogger('./logs/oddswork.log');
const shell = require('shelljs');

let Match = require('../models/match');


router.get('/', function (req, res, next) {
    res.redirect('/logs/all/page/1')
});

router.get('/all', function (req, res) {
    res.redirect('/logs/all/page/1')
});

router.get('/all/page/:id', function (req, res) {

    Match.paginate({archive: false}, {page: req.params.id}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for (let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('logs/index', {
                logs: result.docs.sort(function (left, right) {
                    return moment(left.date).diff(moment(right.date))
                }),
                pagesarr: pagesarr,
                page_id: req.params.id
            });

        } else {
            console.log(err);
            res.end('Error');
        }
    });
});

router.post('/disable/:id', function (req, res) {
    Match.findByIdAndUpdate(req.params.id, {archive: true}, function (err) {
        if (err) {
            logger.error('Failed to set archive.')
        } else {
            res.sendStatus(200);
        }
    })
});

router.get('/restartparser/:flag', function (req, res) {
    if (req.params.flag === 'true') {
        shell.exec('pm2 restart all');
        res.sendStatus(200);
    }
});

module.exports = router;
