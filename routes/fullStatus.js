const services = require('../services.json');
const fetch = require('node-fetch');

module.exports = {
    method: 'get',
    path: '/api/status',
    name: 'fullStatus',
    execute(req, res, app) {
        app.log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);

        let key = req.query['key'];


        // if (!key || !(app.config.keys.includes(key))) {
        //     log.warn("Someone attempted to update a server with an invalid key (401)");
        //     res.status(401);
        //     res.send({
        //         "status": 401,
        //         "message": "invalid api key"
        //     });
        //     return res.end();
        // };




        // authorised request, process the data
        let data = {
            status: 200,
            message: 'success',
            summary: {},
            services: {
                minecraft: {},
                websites: {},
                external: {}
            }
        };

        fetch(app.config.statuspage.public_api + 'status.json')
            .then(res => res.json())
            .then(json => {

                data.summary = {
                    indicator: json.status.indicator,
                    description: json.status.description,
                    status: app.config.statuses[app.config.statuspage.indicators[json.status.indicator]],
                };
                data.summary.status.short = app.config.statuspage.indicators[json.status.indicator];

                app.db.query(`SELECT * FROM minecraft;`, (err, result) => {
                    if (err) return app.log.error(err);
                    // log.debug(result);

                    for (let i = 0; i < result.length; i++) {
                        let server = result[i];
                        data.services.minecraft[server.id] = server;

                        data.services.minecraft[server.id].extended = app.config.statuses[server.status];
                        data.services.minecraft[server.id].extended.short = server.status;
                    };

                    app.db.query(`SELECT * FROM websites;`, (err, result) => {
                        if (err) return app.log.error(err);
                        // log.debug(result);


                        for (let i = 0; i < result.length; i++) {
                            let site = result[i];
                            if (services.websites[site.id]) {
                                data.services.websites[site.id] = site;
                                data.services.websites[site.id].extended = app.config.statuses[site.status];
                                data.services.websites[site.id].extended.short = site.status;
                            };

                            if (services.external[site.id]) {
                                data.services.external[site.id] = site;
                                data.services.external[site.id].extended = app.config.statuses[site.status];
                                data.services.external[site.id].extended.short = site.status;
                            };

                        };

                        // send data
                        res.status(200).send(data);
                        res.end();
                    });
                });
            });
    },
};