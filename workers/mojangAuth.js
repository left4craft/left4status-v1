const services = require('../services.json');
const fetch = require('node-fetch');

module.exports = {
    name: 'mojangAuth',
    run(app) {
        fetch(services.external.mojang.api.url)
            .then(res => res.json())
            .then(json => {
                // console.log(json)

                let authserver = json[3]; // idk how to do it better
     
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

                log.info(`Mojang Auth Server is ${app.config.statuses[status].title}`);

                app.db.query('UPDATE websites SET last_online=? WHERE id = "mojang";', [Date.now()], (err, result) => {
                    if (err) return app.log.error(err);

                    app.workers.sendExternalStatus.run(status, 'mojang', app);
                });
            });
    }
}