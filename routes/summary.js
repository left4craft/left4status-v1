const fetch = require('node-fetch');

module.exports = {
    method: 'get',
    path: '/api/summary',
    name: 'summary',
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
            summary: {}
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

                // send data
                res.status(200).send(data);
                res.end();
            });
    },
};