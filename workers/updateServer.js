const services = require('../services.json');

module.exports = {
    name: 'updateServer',
    run(app, data) {
        const now = Date.now();
        let expires = now + Math.floor(Math.min(240, 2400 / data.tps) * 1000);

        app.db.query(`UPDATE minecraft SET player_count = ${data.player_count}, players = "${data.players}", tps = ${data.tps}, last_online = ${now}, expires = ${expires} WHERE id = "${data.server}";`, (err, result) => {
            if (err) return app.log.error(err);
            // log.debug(result);
            app.log.console(`Updated '${services.minecraft.servers[data.server].name}', expires in ${((expires - now) / (1000 * 60)).toFixed(1)} mins`);

            if (data.tps < app.config.minecraft.degraded) { // if less than 15
                if (data.tps < app.config.minecraft.partial) return app.workers.sendServerStatus.run('partial', data, app); // if less than 10
                app.workers.sendServerStatus.run('degraded', data, app); // otherwise if <15 but >10
            } else app.workers.sendServerStatus.run('operational', data, app); // if higher than 15

            if (services.minecraft.servers[data.server].players_metric) { // bungee player count
                app.log.console('Sending players metric');
                app.workers.sendMetric.run(services.minecraft.servers[data.server].players_metric, data.player_count, app);
            };

            if (services.minecraft.servers[data.server].tps_metric) { // survival tps
                app.log.console('Sending tps metric');
                app.workers.sendMetric.run(services.minecraft.servers[data.server].tps_metric, data.tps, app);
            };

            setTimeout(() => {
                app.db.query(`SELECT expires FROM minecraft WHERE id = "${data.server}";`, (err, result) => { // get current expiration
                    if (err) return app.log.error(err);
                    if (result[0].expires < Date.now()) {
                        // server is offline!!
                        app.workers.sendServerStatus.run('major', data, app);
                    };
                }); 
            }, expires - now);
        });
    }
}