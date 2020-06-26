const services = require('../services.json');

module.exports = {
    method: 'get',
    path: '/api/updateServer/:server/',
    name: 'updateServer',
    execute(req, res, app) {
        app.log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);

        let server = req.params.server;
        let key = req.query['key'];

        if (!services.minecraft.servers[server]) {
            app.log.warn("Someone attempted to update an unkown server (400)");
            res.status(400).send({
                "status": 400,
                "message": "unknown server"
            });
            return res.end();
        }

        if (!key || !(app.config.keys.includes(key))) {
            app.log.warn("Someone attempted to update a server with an invalid key (401)");
            res.status(401).send({
                "status": 401,
                "message": "invalid api key"
            });
            return res.end();
        };

        // authorised request, process the data

        if (!req.query['player_count'] || !req.query['tps']) {
            res.status(400).send({
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

        app.log.info(`${services.minecraft.servers[server].name} is online with ${data.player_count} players and a TPS of ${data.tps}`);

        // update the server
        app.workers.updateServer.run(app, data);

        res.status(200).send({
            "status": 200,
            "message": "success",
            "metrics": {
                "players": services.minecraft.servers[data.server].players_metric ? true : false,
                "tps": services.minecraft.servers[data.server].tps_metric ? true : false
            }
        });
        res.end();
    }
};