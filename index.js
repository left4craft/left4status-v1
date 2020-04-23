/**
 * @name left4status
 * @author eartharoid <contact@eatharoid.me>
 * @website https://www.left4craft.org
 * @license MIT
 */

const express = require('express');
const app = express();
const http = require('http').createServer(app);
const bodyParser = require('body-parser');
const mysql = require('mysql');
const fs = require('fs');
const log = require('leekslazylogger');
const isReachable = require('is-reachable');

const config = require('./config');
const database = require('./database');
const services = require('./services.json');

const Discord = require('discord.js');
const hook = new Discord.WebhookClient(config.discord.webhook.id, config.discord.webhook.token);

const db = mysql.createConnection({
    host: database.host,
    // port: database.port,
    user: database.user,
    // password: database.password,
    database: database.name
});


// logger setup
log.setup({
    logToFile: false,
    timestamp: "DD/MM/YY hh:mm:ss",
    custom: {
        db: {
            title: 'MySQL',
            colour: 'cyanBright'
        }
    }
});

/**
 * Database
 */
db.connect(function (err) {
    // db.query(`DROP TABLE minecraft`) // reset database for development
    if (err) { // if connection fails
        log.warn("Could not connect to database");
        log.warn(log.colour.bgYellowBright(log.color.black("CRITICAL: NO DATABASE CONNECTION - FATAL ERROR WILL LIKELY OCCUR")) + log.colour.bgBlack(""));
        return log.error(err);
    };

    log.success(`Connected to database (${database.name}@${database.host})`);

    db.query(`SELECT 1 FROM minecraft LIMIT 1;`, function (err, result) {
        if (err) { // if table does not exist
            log.warn(log.colour.bgYellowBright(log.color.black("'minecraft': TABLE IS MISSING: Please run 'node setup' to setup the database")) + log.colour.bgBlack(""));
            return log.error(err);
        };
        log.success(`'minecraft' table exists`)
    });

    // db.query(`SELECT 1 FROM mc_query LIMIT 1;`, function (err, result) {
    //     if (err) { // if table does not exist
    //         log.warn(log.colour.bgYellowBright(log.color.black("'mc_query': TABLE IS MISSING: Please run 'node setup' to setup the database")) + log.colour.bgBlack(""));
    //         return log.error(err);
    //     };
    //     log.success(`'mc_query' table exists`)
    // });

    db.query(`SELECT 1 FROM websites LIMIT 1;`, function (err, result) {
        if (err) { // if table does not exist
            log.warn(log.colour.bgYellowBright(log.color.black("'websites': TABLE IS MISSING: Please run 'node setup' to setup the database")) + log.colour.bgBlack(""));
            return log.error(err);
        };
        log.success(`'websites' table exists`)
    });
});


// JSON Body Parser for POST reqs
app.use(bodyParser.json());
app.use(express.static('./public/'))


/**
 * Workers
 */

const workers_dir = fs.readdirSync('./workers').filter(file => file.endsWith('.js'));
const workers = {};
for (const file of workers_dir) {
    const worker = require(`./workers/${file}`);
    workers[worker.name] = worker;
    log.console(`[WORKERS] > Loaded '${worker.name}' worker`);
};


/**
 * Routes
 */

const routes_dir = fs.readdirSync('./routes').filter(file => file.endsWith('.js'));

let runner = {
    db: db,
    workers: workers,
    log: log,
    hook: hook
}
for (const file of routes_dir) {
    const route = require(`./routes/${file}`);
    app[route.method](route.path, (req, res) => route.execute(req, res, runner));
    log.console(`[ROUTE MANAGER] > Loaded ${route.method.toUpperCase()} '${route.name}' route`);
};


/**
 * Pingers
 */

// Bungee Proxy
workers.queryBungee.run(runner);
setInterval(() => {
    workers.queryBungee.run(runner);
}, services.minecraft.servers.proxy.interval * 60000);

// websites
let sites = services.websites;
for (site in sites) {
    let s = site;
    setInterval(async () => {
        workers.updateSite.run(runner, s, await isReachable(sites[s].host));
    }, config.ping_interval * 60000);
};


// external APIs
let external = services.external;
for (api in external) {
    let a = api;

    //////////////////////////////////////////////////////
    workers[services.external[a].worker].run(runner);
    //////////////////////////////////////////////////////

    setInterval(() => {
        workers[services.external[a].worker].run(runner);
    }, services.external[a].interval * 60000);
};


// start the server
log.info("Starting HTTP server");
http.listen(8080);