const parser = require('./common/parser');
const dbConfig = require('./common/db');
const mongoose = require('mongoose');
const config = require('./common/config');
const helpers = require('./common/helpers');

let Log = require('./models/log');


mongoose.connect(dbConfig.database, { useNewUrlParser: true });
let db = mongoose.connection;

db.on('error', function (err) {
    console.log(err);
});

(async () => {

    let matches =  await parser.parseMatches('json');

    let links = matches.links;

    await helpers.asyncForEach(links, async (link) => {
        let match = await parser.parseMatch(config.baseUrl + link, 'json', true);

        if (match) {

            let entMatch = await proceedMatch(match);
            await saveToLog(entMatch);
        }
    });

})();

async function proceedMatch(match) {

    return new Promise(function (resolve, reject) {

        if (match) {

            let delta_pin = match.pinnacle.blob.items[0].val - match.pinnacle.blob.items[match.pinnacle.blob.items.length - 1].val;
            let delta_xbet = (match.xbet.blob) ? match.xbet.blob.items[0].val - match.xbet.blob.items[match.xbet.blob.items.length - 1].val : 0;
            let delta_mar = (match.marathonbet.blob) ? match.marathonbet.blob.items[0].val - match.marathonbet.blob.items[match.marathonbet.blob.items.length - 1].val : 0;

            let varDate = Date.parse(match.date);
            let now = new Date();

            if ((delta_pin >= 0.09 || delta_xbet >=0.9 || delta_mar >= 0.9) && ((varDate - now) < 10800) && (varDate > now)) {
                match.pinnacle.delta = Math.round(delta_pin * 100) / 100;
                match.xbet.delta = Math.round(delta_xbet * 100) / 100;
                match.marathonbet.delta = Math.round(delta_mar * 100) / 100;
            }

            resolve(match)
        }
        else {
            reject('error')
        }
    });
}

async function saveToLog(entity) {

    let logEntity = await new Log();
    logEntity.title = await entity.title;
    logEntity.date = Date.parse(await entity.date);
    logEntity.pinnacle = await entity.pinnacle;
    logEntity.marathonbet = await entity.marathonbet;
    logEntity.xbet = await entity.xbet;
    await logEntity.save(function (err) {
        if (err) {
            return (err)
        } else {
            console.log(logEntity.title + ' saved.');
            return true;
        }
    });

}