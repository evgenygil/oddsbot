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

    Match.paginate({archive: true}, {page: req.params.id}).then(function (result, err) {
        if (!err) {

            let pagesarr = [];
            for (let i = 1; i <= result.pages; i++) {
                pagesarr.push(i)
            }

            res.render('archive/index', {
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

router.post('/delete/:id', function (req, res) {
    Match.findByIdAndRemove(req.params.id, function (err) {
        if (err) {
            logger.error('Failed to delete from archive.');
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    })
});

router.post('/delete-all/', function (req, res) {
    Match.remove({archive: true}, function (err) {
        if (err) {
            logger.error('Failed to delete archive.');
            res.sendStatus(500);
        } else {
            res.sendStatus(200);
        }
    })
});

module.exports = router;
