const log = require('leekslazylogger');
const config = require('../config');
const services = require('../services.json');

module.exports = {
    method: 'post',
    path: '/api/updateServer/:server/',
    name: 'updateServer',
    execute(req, res, app) {
        log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);

        let server = req.params.server;
        let key = req.query['key'];


        if(!services.minecraft.servers[server]) {
            log.warn("Someone attempted to update an unkown server (400)");
            res.status(400);
            res.send({
                "status": 400,
                "message": "unknown server"
            });
            return res.end();
        }

        if (!key || !(config.keys.includes(key))) {
            log.warn("Someone attempted to update a server with an invalid key (401)");
            res.status(401);
            res.send({
                "status": 401,
                "message": "invalid api key"
            });
            return res.end();
        };

        
  

        // authorised request, process the data

        if(!req.query['player_count'] || !req.query['tps']) {
            res.status(400);
            res.send({
                "status": 400,
                "message": "invalid data",
                "query": ["player_count", "players", "tps"]
            });
            return res.end();
        };

        let data = {
            server: server,
            player_count: Number(req.query['player_count']),
            players: req.query['players'].trim().split(','),
            tps: Math.min(20, Number(Number(req.query['tps']).toFixed(2)))
        };

        log.info(`${services.minecraft.servers[server].name} is online with ${data.player_count} players and a TPS of ${data.tps}`)

        // update the server
        app.workers.updateServer.run(app, data);

        res.status(200);
        res.send({
            "status": 200,
            "message": "success"
        });
        res.end();
    }
};