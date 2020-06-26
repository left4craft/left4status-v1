const services = require('../services.json');

module.exports = {
    method: 'get',
    path: '/api/status/:type',
    name: 'status',
    execute(req, res, app) {
        app.log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);

        let type = req.params.type;
        let key = req.query['key'];

        if (!services[type]) {
            app.log.warn('Someone attempted to update an unkown server (400)');
            res.status(400);
            res.send({
                'status': 400,
                'message': 'unknown service type',
                'can_be_one_of': ['minecraft', 'websites', 'external']
            });
            return res.end();
        }

        // if (!key || !(app.config.keys.includes(key))) {
        //     log.warn('Someone attempted to update a server with an invalid key (401)');
        //     res.status(401);
        //     res.send({
        //         'status': 401,
        //         'message': 'invalid api key'
        //     });
        //     return res.end();
        // };


        // authorised request, process the data
        let data = {
            status: 200,
            message: 'success',
            services: {}
        };

        let table = type === 'external' ? 'websites' : type;

        app.db.query('SELECT * FROM ?', [table], (err, result) => {
            if (err) return log.error(err);
            // log.debug(result);

            for (let i = 0; i < result.length; i++) {
                let service = result[i];
                if (type === 'minecraft') {
                    data.services[service.id] = service;
                    data.services[service.id].extended = app.config.statuses[service.status];
                    data.services[service.id].extended.short = service.status;
                } else {
                    if (services[type][service.id]) {
                        data.services[service.id] = service;
                        data.services[service.id].extended = app.config.statuses[service.status];
                        data.services[service.id].extended.short = service.status;
                    };
                };
            };

            // send data
            res.status(200).send(data);
            res.end();
        });
    },
};