const express = require('express');
const router = express.Router();
const moment = require('moment');

let Match = require('../models/match');


router.get('/', function (req, res, next) {
    res.redirect('/archives/all/page/1')
});

router.get('/all', function (req, res) {
    res.redirect('/archives/all/page/1')
});

router.get('/all/page/:id', function (req, res) {

    Match.paginate({archive: true}, {page: req.params.id, sort: 'updatedAt'}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for (let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('archive/index', {
                logs: result.docs,
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
