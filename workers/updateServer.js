const config = require('../config');
const services = require('../services.json');

module.exports = {
    name: 'updateServer',
    run(app, data) {
        let log = app.log;

        const now = Date.now();
        let expires = Math.floor(now + Math.min(240, 2400 / data.tps) * 1000);

        app.db.query(`UPDATE minecraft SET player_count = ${data.player_count}, players = JSON_ARRAY('${data.players}'), tps = ${data.tps}, last_online = ${now}, expires = ${expires} WHERE id = "${data.server}";`, (err, result) => {
            if (err) return log.error(err);
            // log.debug(result);
            log.console(`Updated '${services.minecraft.servers[data.server].name}', expires in ${((expires - now) / (1000 * 60)).toFixed(1)} mins`);

            if (data.tps < config.minecraft.degraded) {
                if (data.tps < config.minecraft.partial)
                    return app.workers.sendServerStatus.run('partial', data, app);
                app.workers.sendServerStatus.run('degraded', data, app);
            } else {
                app.workers.sendServerStatus.run('operational', data, app);
            }

            if (services.minecraft.servers[data.server].players_metric) {
                log.console('Sending players metric');
                app.workers.sendMetric.run(services.minecraft.servers[data.server].players_metric, data.player_count, app);
            }

            if (services.minecraft.servers[data.server].tps_metric) {
                log.console('Sending tps metric');
                app.workers.sendMetric.run(services.minecraft.servers[data.server].tps_metric, data.tps, app);
            }

            setTimeout(() => {
                if (expires < Date.now()) {
                    // server is offline!!
                    app.workers.sendServerStatus.run('major', data, app);
                };
            }, expires - now);
        });



    }
}