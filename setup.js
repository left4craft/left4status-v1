const mysql = require('mysql');
const log = require('leekslazylogger');
const services = require('./services.json');
const database = require('./database');

const db = mysql.createConnection({
    host: database.host,
    port: database.port,
    user: database.user,
    // password: database.password,
    database: database.name
});

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

db.connect(function (err) {

    if (err) { // if connection fails
        log.warn("Could not connect to database");
        log.warn(log.colour.bgYellowBright(log.color.black("CRITICAL: NO DATABASE CONNECTION")) + log.colour.bgBlack(""));
        return log.error(err);
    };

    log.success(`Connected to database (${database.name}@${database.host})`);

    db.query(`DROP TABLE minecraft;`, (err, result) => {
        if (err) return log.error(err);
        // log.debug(result);
        log.info(`Deleted 'minecraft' table`);
    });

    // db.query(`DROP TABLE mc_query;`, (err, result) => {
    //     if (err) return log.error(err);
    //     // log.debug(result);
    //     log.info(`Deleted 'mc_query' table`);
    // });
    
    db.query(`DROP TABLE websites;`, (err, result) => {
        if (err) return log.error(err);
        // log.debug(result);
        log.info(`Deleted 'websites' table`);
    });

    db.query("CREATE TABLE `api`.`minecraft` ( `id` VARCHAR(128) NOT NULL , `name` VARCHAR(128) NOT NULL , `status` VARCHAR(128) NULL , `player_count` SMALLINT NOT NULL , `players` JSON NOT NULL , `tps` DECIMAL(4,2) NOT NULL , `last_online` VARCHAR(32) NULL  , `expires` VARCHAR(32) NULL );", (err, result) => {
        if (err) return log.error(err);
        // log.debug(result);
        log.success(`Created 'minecraft' table`);
    });

    // db.query("CREATE TABLE `api`.`mc_query` ( `id` VARCHAR(128) NOT NULL , `name` VARCHAR(128) NOT NULL , `status` VARCHAR(128) NULL , `player_count` SMALLINT NOT NULL , `last_queried` VARCHAR(32) NULL , `last_online` VARCHAR(32) NULL );", (err, result) => {
    //     if (err) return log.error(err);
    //     // log.debug(result);
    //     log.success(`Created 'mc_query' table`);
    // });

    

    db.query("CREATE TABLE `api`.`websites` ( `id` VARCHAR(128) NOT NULL , `name` VARCHAR(128) NOT NULL , `status` VARCHAR(128) NULL , `last_queried` VARCHAR(32) NULL , `last_online` VARCHAR(32) NULL );", (err, result) => {
        if (err) return log.error(err);
        // log.debug(result);
        log.success(`Created 'websites' table`);
    });



    // add minecraft servers to table
    let servers = services.minecraft.servers;
    for (server in servers) {
        let s = server;
        db.query(`INSERT INTO minecraft (id, name, player_count, players, tps) VALUES ('${s}', '${servers[s].name}', 0, '[]', 0);`, (err, result) => {
            if (err) return log.error(err);
            // log.debug(result);
            log.console(`Added '${servers[s].name}' server to the 'minecraft' table`);
        }); 
    }

    // add websites
    let sites = services.websites;
    for (site in sites) {
        let s = site;
        db.query(`INSERT INTO websites (id, name) VALUES ('${s}', '${sites[s].name}');`, (err, result) => {
            if (err) return log.error(err);
            // log.debug(result);
            log.console(`Added '${sites[s].name}' website to the 'websites' table`);
        }); 
    };

    // db.query(`INSERT INTO mc_query (id, name, player_count) VALUES ('proxy', '${services.minecraft.servers.proxy.name}', 0);`, (err, result) => {
    //     if (err) return log.error(err);
    //     // log.debug(result);
    //     log.console(`Added '${services.minecraft.servers.proxy.name}' to the 'mc_query' table`);
    //     log.info("Done")
    // });


    log.info("Setup process does not automatically exit after it is finished (Ctrl+C)", 'yellowBright')

});

