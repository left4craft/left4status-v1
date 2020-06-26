const services = require('../services.json');
const fetch = require('node-fetch');

module.exports = {
    name: 'discordAPI',
    run(app) {
        fetch(services.external.discord.api.url)
            .then(res => res.json())
            .then(json => {
                // let component = json.components.filter(c => c.name === "API")[0];
                let api = json.components.find(c => c.name === "API");

                let status;
                switch (api.status) {
                    case 'operational':
                        status = 'operational';
                        break;
                    case 'degraded_performance':
                        status = 'degraded';
                        break;
                    case 'partial_outage':
                        status = 'partial';
                        break;
                    case 'major_outage':
                        status = 'major';
                        break;
                };

                app.log.info(`Discord API is ${app.config.statuses[status].title}`);

                app.db.query('UPDATE websites SET last_online=? WHERE id = "discord";', [Date.now()], (err, result) => {
                    if (err) return app.log.error(err);

                    app.workers.sendExternalStatus.run(status, 'discord', app);
                });
            });
    }
}