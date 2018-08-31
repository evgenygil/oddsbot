const express = require('express');
const router = express.Router();

let CalcFilter = require('../models/calcfilter');


router.get('/', function (req, res, next) {
    CalcFilter.find({})
        .sort('-createdAt')
        .exec(function (err, filters) {
            if (err) {
                console.log(err);
            } else {

                res.render('calcfilter/index', {
                    title: 'Calculator Filters',
                    filters: filters
                });
            }
        });
});

router.post('/add', function (req, res) {

    let filter = new CalcFilter();
    filter.type = req.body.type;
    filter.value = req.body.value;
    filter.comment = req.body.comment;

    filter.save(function (err) {
        if (err) {
            return console.log(err);
        } else {
            req.flash('success', 'CalcFilter Added');
            res.redirect('/calcfilters');
        }
    });
});

router.get('/delete/:id', function (req, res) {
    CalcFilter.findById(req.params.id, function (err, post) {

        CalcFilter.findById(req.params.id).remove().exec(function (err, data) {
            if (!err) {
                req.flash('success', 'CalcFilter Deleted');
                res.redirect('/calcfilters');
            }
        });
    });
});


module.exports = router;
