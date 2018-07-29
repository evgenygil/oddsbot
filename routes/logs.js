const express = require('express');
const router = express.Router();
const moment = require('moment');

let Log = require('../models/log');


router.get('/', function (req, res, next) {
    res.redirect('/logs/all/page/1')
});

router.get('/all', function (req, res) {
    res.redirect('/logs/all/page/1')
});

router.get('/all/page/:id', function (req, res) {

    Log.paginate({}, {page: req.params.id}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for (let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('logs/index', {
                logs: result.docs.sort(function (left, right) {
                    return moment(left.timeStamp).diff(moment(right.timeStamp))
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

module.exports = router;
