const config = require('../config');
const fetch = require('node-fetch');

module.exports = {
    name: 'sendMetric',
    run(metric, data, app) {
        let log = app.log;

        fetch(`https://api.statuspage.io/v1/pages/${config.statuspage.page_id}/metrics/${metric}/data`, {
                method: 'post',
                body: JSON.stringify({
                    data: {
                        timestamp: Date.now() / 1000,
                        value: data
                    }
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': config.statuspage.api_key
                },
            })
            .then(log.info(`Submitted metric to statuspage`))
            // .then(res => res.json())
            // .then(json => console.log(json));

    }
}