const config = require('../config');
const fetch = require('node-fetch');
const services = require('../services.json');

module.exports = {
    name: 'updateSite',
    run(app, site, online) {
        let log = app.log;

        log.console(`${services.websites[site].name} is ${log.colour[online ? 'greenBright' : 'redBright'](online ? 'online' : 'offline')}`)

        const now = Date.now();
        // const expires = Math.floor((now + (config.ping_interval * 2)) * 1000);

        app.db.query(`UPDATE websites SET last_online = ${now} WHERE id = "${site}";`, (err, result) => {
            if (err) return log.error(err);
            // log.debug(result);
            // log.console(`Updated '${services.websites[site].name}'`);

            app.workers.sendSiteStatus.run(online ? 'operational' : 'major', site, app);
            
        });


        

    }
}