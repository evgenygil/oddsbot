const express = require('express');
const router = express.Router();
const parser = require('../common/parser');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('settings/index', {title: 'Settings'});
});


module.exports = router;
