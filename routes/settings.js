const express = require('express');
const router = express.Router();
const editJsonFile = require('edit-json-file');
let settings = editJsonFile('./common/settings.json');

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('settings/index', {title: 'Settings', settings: settings.data});
});

router.post('/edit', function (req, res, next) {
        settings.set("min_duration", parseFloat(req.body.min_duration));
        settings.set("max_duration", parseFloat(req.body.max_duration));
        settings.set("pup_timeout", parseFloat(req.body.pup_timeout));
        settings.set("match_list_load", parseFloat(req.body.match_list_load));
        settings.set("timezone_load", parseFloat(req.body.timezone_load));
        settings.set("bets_interal", parseFloat(req.body.bets_interal));
        settings.set("tg_panic_time", parseFloat(req.body.tg_panic_time));
        settings.set("sleep_after_match", parseFloat(req.body.sleep_after_match));
        settings.set("sleep_after_loop", parseFloat(req.body.sleep_after_loop));
        settings.save();
        res.redirect('/settings');
});


module.exports = router;
