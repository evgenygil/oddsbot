const fs = require('fs');
const logger = require('logger').createLogger('./logs/oddswork.log');

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array).catch((e) => { (e) ? logger.info(e) : null })
    }
}

const readFile = (path, opts = 'utf8') =>
    new Promise((res, rej) => {
        fs.readFile(path, opts, (err, data) => {
            if (err) rej(err);
            else res(data)
        })
    });

const writeFile = (path, data, opts = 'utf8') =>
    new Promise((res, rej) => {
        fs.truncate(path, null, () => {
            fs.writeFile(path, data, opts, (err) => {
                if (err) rej(err);
                else res()
            })
        })
    });

module.exports = {
    asyncForEach,
    readFile,
    writeFile
};