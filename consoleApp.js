process.setMaxListeners(0);

const parser = require('./common/parser');
const dbConfig = require('./common/db');
const mongoose = require('mongoose');
const config = require('./common/config');
const helpers = require('./common/helpers');
const telegram = require('telegram-bot-api');
const logger = require('logger').createLogger('./logs/oddswork.log');
const moment = require('moment');

let Match = require('./models/match');

let tgApi = new telegram({token: config.telegramToken});

const timeout = ms => new Promise(res => setTimeout(res, ms));

mongoose.connect(dbConfig.database, {useNewUrlParser: true});
let db = mongoose.connection;

db.on('error', function (err) {
    console.log(err);
});

// (async () => {
//
//     logger.info('Start working...');
//
//     let matches = await parser.parseMatches().catch((e) => logger.error('parseMatches error: ', e.stack));
//
//     logger.info('Total matches to parse: ' + matches.length);
//     console.log('Total matches to parse: ' + matches.length);
//
//     let matchesFile = await helpers.readFile('data.odb').catch((e) => logger.error('readFile error: ', e.stack));
//     let oldMatches = await matchesFile.split(',');
//
//     await helpers.asyncForEach(matches, async (link) => {
//         let match = await parser.parseMatch(config.baseUrl + link, 'json').catch((e) => logger.error('parseMatch error: ', e.stack));
//
//         if (match !== undefined && match !== null) {
//
//             let entMatch = await proceedMatch(match);
//
//             if (entMatch !== undefined) {
//                 await saveToLog(entMatch).catch((e) => logger.error('Saving to log error ', e.stack));
//                 if ((oldMatches.length > 0) && (oldMatches.indexOf(link) < 0)) {
//                     await sendToTelegram(entMatch).catch((e) => logger.error('Send to TG error ', e.stack));
//                 }
//             }
//         }
//
//         timeout(3000);
//     });
//
//     await helpers.writeFile('data.odb', matches);
//
//
// })();

(async () => {

    // await Match.collection.drop();

    // let oldlinks = await [];

    await console.log(moment().add(config.timeCorrect, 'hours').format('DD.MM.YYYY HH:mm') + ': Start working...');

    let matches = await parser.parseMatches().catch((e) => logger.error('parseMatches error: ', e.stack));

    await console.log(moment().add(config.timeCorrect, 'hours').format('DD.MM.YYYY HH:mm') + ': Total matches to parse: ' + matches.length);

    // let matchesFile = await helpers.readFile('data.odb').catch((e) => logger.error('readFile error: ', e.stack));
    // let oldMatches = await matchesFile.split(',');

    await helpers.asyncForEach(matches, async (link) => {
        let match = await parser.parseMatch(config.baseUrl + link.href, 'json', link.time).catch((e) => logger.error('parseMatch error: ', e.stack));

        if (match !== undefined && match !== null) {

            let entMatch = await proceedMatch(match);

            if (entMatch !== undefined) {
                await saveToLog(entMatch).catch((e) => logger.error('Saving to log error ', e.stack));
                // if ((oldMatches.length > 0) && (oldMatches.indexOf(link.href) < 0)) {
                //     await sendToTelegram(entMatch).catch((e) => logger.error('Send to TG error ', e.stack));
                // }
            }
        }

        await oldlinks.push(link.href);

        timeout(3000);


    });

    // await helpers.writeFile('data.odb', oldlinks);

    await process.exit();

})();


async function sendToTelegram(match) {

    if (match) {

        let data =
            moment((match.date + ':00'), 'HH:mm:ss a').format('HH:mm') + ': *' + match.league + ' | ' + match.title + '* \n' +
            'Pinnacle: delta = ' + match.pinnacle.delta + ', odds: ' + (match.pinnacle.odds).join(', ') + '\n' +
            '1Xbet: delta = ' + match.xbet.delta + ', odds: ' + (match.xbet.odds).join(', ') + '\n' +
            'Marathonbet: delta = ' + match.marathonbet.delta + ', odds: ' + (match.marathonbet.odds).join(', ') + '\n';

        await tgApi.sendMessage({
            chat_id: '-1001298394534',
            text: data,
            parse_mode: 'Markdown'
        })
            .then(function () {
                logger.info(match.title + ' sended to telegram');
            })
            .catch(function (err) {
                logger.error('Send to TG API error ', err.stack);
            });
    }

}

async function proceedMatch(match) {

    return new Promise(function (resolve, reject) {

        if (match) {

            // let delta_pin = (match.pinnacle.blob) ? match.pinnacle.blob.items[0].val - match.pinnacle.blob.items[match.pinnacle.blob.items.length - 1].val : 0;
            let delta_pin = (match.pinnacle.blob) ? match.pinnacle.blob.items[0].val - match.pinnacle.blob.openOdds.val : 0;
            let delta_xbet = (match.xbet.blob) ? match.xbet.blob.items[0].val - match.xbet.blob.openOdds.val : 0;
            let delta_mar = (match.marathonbet.blob) ? match.marathonbet.blob.items[0].val - match.marathonbet.blob.openOdds.val : 0;

            if ((delta_pin >= 0.09 || delta_xbet >= 0.09 || delta_mar >= 0.09)) {
                match.pinnacle.delta = Math.round(delta_pin * 100) / 100;
                match.xbet.delta = Math.round(delta_xbet * 100) / 100;
                match.marathonbet.delta = Math.round(delta_mar * 100) / 100;
                resolve(match);
            } else {
                logger.info(match.title + ' is not interesting match');
                console.log(match.title + ' is not interesting match');
                reject(false);
            }

        }
        else {
            reject('error')
        }
    });
}

async function saveToLog(entity) {

    let logEntity = await new Match();
    logEntity.title = await entity.title;
    logEntity.league = await entity.league;
    logEntity.link = await entity.link;
    logEntity.date = await entity.date;
    logEntity.pinnacle = await entity.pinnacle;
    logEntity.marathonbet = await entity.marathonbet;
    logEntity.xbet = await entity.xbet;
    await logEntity.save(function (err) {
        if (err) {
            logger.error('Error saving to DB, ', entity.title);
            return (err)
        } else {
            logger.info(logEntity.title + ' saved.');
            return true;
        }
    });

}