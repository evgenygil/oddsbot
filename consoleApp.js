process.setMaxListeners(0);

const parser = require('./common/parser');
const dbConfig = require('./common/db');
const mongoose = require('mongoose');
const config = require('./common/config');
const helpers = require('./common/helpers');
const telegram = require('telegram-bot-api');
const logger = require('logger').createLogger('./logs/oddswork.log');
const moment = require('moment');
let settings = require('./common/settings');

let Match = require('./models/match');

let tgApi = new telegram({token: config.telegramToken});

const timeout = ms => new Promise(res => setTimeout(res, ms));

mongoose.connect(dbConfig.database, {useNewUrlParser: true});
let db = mongoose.connection;

db.on('error', function (err) {
    logger.error(err);
});


// Fire!

(async () => {

    // let oldlinks = await [];

    await logger.info(moment().format('DD.MM.YYYY HH:mm') + ': Start working...');

    await Match.update({date: {$lt: moment().add(settings.min_duration, 'minutes').format('DD.MM.YYYY HH:mm')}}, {archive: true}, {multi: true});

    // await Match.remove({archive: false}).exec();

    let matches = await parser.parseMatches().catch((e) => logger.error('parseMatches error: ', e.stack));

    await logger.info(moment().format('DD.MM.YYYY HH:mm') + ': Total matches to parse: ' + matches.length);

    // let matchesFile = await helpers.readFile('data.odb').catch((e) => logger.error('readFile error: ', e.stack));
    // let oldMatches = await matchesFile.split(',');

    let ignoreTg = await Match.find({archive: true}).exec();
    let ignoreList = await ignoreTg.map(itm => itm.link);

    await helpers.asyncForEach(matches, async (link) => {
        let match = await parser.parseMatch(config.baseUrl + link.href, 'json', link.time).catch((e) => logger.error('parseMatch error: ', e.stack));

        if (match !== undefined && match !== null) {

            let entMatch = await proceedMatch(match);

            if (entMatch !== undefined) {

                await saveToLog(entMatch).catch((e) => logger.error('Saving to log error ', e.stack));

                let now = await moment();
                let timeMoment = await moment((entMatch.date + ':00'), 'DD.MM.YYYY HH:mm:ss a');
                let duration = await timeMoment.diff(now, 'minutes');

                if ((ignoreList.length > 0) && (ignoreList.indexOf(config.baseUrl + link.href) < 0) && (duration < settings.tg_panic_time)) {
                    await sendToTelegram(entMatch).catch((e) => logger.error('Send to TG error ', e.stack));
                }
            }
        }

        // await oldlinks.push(link.href);

        await timeout(settings.sleep_after_match);


    });

    // await helpers.writeFile('data.odb', oldlinks);

    await timeout(settings.sleep_after_loop);
    await process.exit();

})();


async function sendToTelegram(match) {

    if (match) {

        let data =
            match.date + ': *' + match.league + ' | ' + match.title + '* \n' +
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
                logger.info(match.title + ' is interested - adding...');
                resolve(match);
            } else {
                logger.info(match.title + ' is not interesting match');
                reject(false);
            }

        }
        else {
            reject('error')
        }
    });
}


async function saveToLog(entity) {
    let matchEntity = await new Match();
    matchEntity.title = await entity.title;
    matchEntity.league = await entity.league;
    matchEntity.link = await entity.link;
    matchEntity.date = await entity.date;
    matchEntity.pinnacle = await entity.pinnacle;
    matchEntity.marathonbet = await entity.marathonbet;
    matchEntity.xbet = await entity.xbet;
    await matchEntity.save(function (err) {
        if (err) {
            Match.findOneAndUpdate({title: entity.title, date: entity.date}, {$set: {
                    league: entity.league,
                    link: entity.link,
                    pinnacle: entity.pinnacle,
                    marathonbet: entity.marathonbet,
                    xbet: entity.xbet
                }}, function (err) {
                if (err) {
                    logger.error('Error updating match' + err);
                } else {
                    logger.info('Match ' + entity.title + ' updated.');
                }
            });
            return (err)
        } else {
            logger.info(matchEntity.title + ' saved.');
            return true;
        }
    });
}