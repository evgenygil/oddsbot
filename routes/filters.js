const express = require('express');
const router = express.Router();

let Filter = require('../models/filter');


router.get('/', function (req, res, next) {
    Filter.find({})
        .sort('-createdAt')
        .exec(function (err, filters) {
            if (err) {
                console.log(err);
            } else {

                res.render('filter/index', {
                    title: 'Filters',
                    filters: filters
                });
            }
        });
});

router.post('/add', function (req, res) {

    let filter = new Filter();
    filter.type = req.body.type;
    filter.value = req.body.value;
    filter.comment = req.body.comment;

    filter.save(function (err) {
        if (err) {
            return console.log(err);
        } else {
            req.flash('success', 'Filter Added');
            res.redirect('/filters');
        }
    });
});

router.get('/delete/:id', function (req, res) {
    Filter.findById(req.params.id, function (err, post) {

        Filter.findById(req.params.id).remove().exec(function (err, data) {
            if (!err) {
                req.flash('success', 'Filter Deleted');
                res.redirect('/filters');
            }
        });
    });
});


module.exports = router;
