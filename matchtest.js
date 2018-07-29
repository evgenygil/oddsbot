const dbConfig = require('./common/db');
const mongoose = require('mongoose');
process.setMaxListeners(0);

const parser = require('./common/parser');
const config = require('./common/config');
const helpers = require('./common/helpers');
const telegram = require('telegram-bot-api');
const logger = require('logger').createLogger('./logs/oddswork.log');
const moment = require('moment');

let Log = require('./models/match');

let tgApi = new telegram({token: config.telegramToken});

const timeout = ms => new Promise(res => setTimeout(res, ms));

mongoose.connect(dbConfig.database, {useNewUrlParser: true});
let db = mongoose.connection;

db.on('error', function (err) {
    console.log(err);
});


let Filter = require('./models/filter');

// (async () => {
//     let arr = await [
//         { href: '/soccer/sweden/division-1-sodra/atvidabergs-grebbestads-hlMNKZji/' },
//         { href: '/soccer/world/club-friendly/ferreira-moreirense-jLRwitv8/' },
//         { href: '/soccer/world/club-friendly/oudenaarde-royal-excel-mouscron-WrgnWfSK/' },
//         { href: '/soccer/europe/euro-u19/portugal-italy-xSjgzWF8/' },
//         { href: '/soccer/europe/europa-league/progres-niedercorn-gabala-vwYnhrwi/' },
//         { href: '/soccer/europe/europa-league/nordsjaelland-cliftonville-hMR9piyr/' },
//         { href: '/soccer/world/club-friendly/ue-olot-espanyol-CdsNm11d/' },
//         { href: '/soccer/world/club-friendly/beerschot-wilrijk-kortrijk-pncjVEsR/' },
//         { href: '/soccer/world/club-friendly/leonesa-covadonga-2RqIQYkr/' },
//         { href: '/soccer/poland/division-2/leonesa-covadonga-2RqIQYkr/' },
//         { href: '/soccer/poland/division-1/leonesa-covadonga-2RqIQYkr/' },
//         { href: '/soccer/world/club-friendly/leonesa-covadonga-2RqIQYkr/' },
//         { href: '/soccer/world/one-friendly/leonesa-covadonga-2RqIQYkr/' }
//     ];
//
// // let countries = ['sweden', 'brazil', 'sudan'];
// // let leagues = ['europa-league', 'one-friendly', 'two-friendly'];
// //
// // let filtered = arr.filter(notInLists);
//
//     let countryChamp = await Filter.find({type: 3}).select('value').exec(); // league
//
//     let countryChampArr = await countryChamp.map(function (e) {
//         return e.value
//     });
//
//     const checker = value =>
//         !countryChampArr.some(element => value.href.includes(element));
//
// // function notInLists(value) {
// //
// //     let splitted = value.split('/');
// //     let country = splitted[2];
// //     let league = splitted[3];
// //
// //     return ((countries.indexOf(country) < 0) && (leagues.indexOf(league) < 0));
// // }
//
//     await console.log(countryChampArr);
//     await console.log(arr.length);
//     let filtered = await arr.filter(checker);
//     await console.log(filtered);
//     await console.log(filtered.length);
//     await process.exit();
// })();


(async () => {
    await console.log('Start');
    let match = await parser.parseMatch('http://www.oddsportal.com/soccer/venezuela/primera-division/deportivo-la-guaira-zulia-nLAg12o2/', 'json', '22:30').catch((e) => logger.error('parseMatch error: ', e.stack));

    await console.log(match.date);
    await console.log('End');
    process.exit();

})();