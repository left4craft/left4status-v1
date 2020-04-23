const config = require('../config');
const services = require('../services.json');
const fetch = require('node-fetch');

module.exports = {
    name: 'mojangAuth',
    run(app) {
        let log = app.log;

        fetch(services.external.mojang.api.url)
            .then(res => res.json())
            .then(json => {
                // console.log(json)

                let authserver = json[3] // idk how to do it better
     
                let status;
                switch (authserver[services.external.mojang.api.service_name]) {
                    case 'green':
                        status = 'operational';
                        break;
                    case 'yellow':
                        status = 'partial';
                        break;
                    case 'red':
                        status = 'major';
                        break;
                };

                log.info(`Mojang Auth Server is ${config.statuses[status].title}`);

                app.db.query(`UPDATE websites SET last_online = ${Date.now()} WHERE id = "mojang";`, (err, result) => {
                    if (err) return log.error(err);

                    app.workers.sendExternalStatus.run(status, 'mojang', app);

                });
            });
    }
}