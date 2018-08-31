# OddsBot
oddsportal.com web parser and analizer for soccer matches with web UI

## Installation

install
 - NodeJS 8+
 - MongoDB
- PM2 (globally)

Then run `npm i` *(from root folder)*

## Run

**If you have got a Telegram chat you can configure bot to send matches to it**
Go to config.js and change

    telegram : true,  
    telegramToken : '< your telegram chat token >'

To start bot run `pm2 start process.json` from root.

Bot uses [puppeteer](https://github.com/GoogleChrome/puppeteer), if it doesn't start on *nix please read [troubleshooting](https://github.com/GoogleChrome/puppeteer/blob/master/docs/troubleshooting.md) , if it's still not working try to uncomment `// pupArgs: ['--no-sandbox']` in `config.js`

When pm2 starts go to localhost:5000

 - **Monitor** - shows active matches
 - **Archive** - past matches and manually deleted 
 - **Match.Filter** - filter on links array (remove if string includes your pattern)
 - **Settings** - bot settings
	 - Min/max duration - search interval (if match in this time it's shows)
	 - Telegram panic delay - time before the match starts from the moment when the sending to telegram begins
	 - waitFor intervals - do not change it if you're not understand what you are doing :)
- *Calculator/Calc.Filter* - do not realized yet, simply get matches from all leagues.

## Roadmap
1. Add hokkey
2. Add API v1
