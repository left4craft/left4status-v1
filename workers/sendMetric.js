const fetch = require('node-fetch');

module.exports = {
    name: 'sendMetric',
    run(metric, data, app) {
        fetch(`https://api.statuspage.io/v1/pages/${app.config.statuspage.page_id}/metrics/${metric}/data`, {
                method: 'post',
                body: {
                    data: {
                        timestamp: Date.now() / 1000,
                        value: data
                    }
                },
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': app.config.statuspage.api_key
                },
            })
            .then(app.log.info(`Submitted metric to statuspage`))
            // .then(res => res.json())
            // .then(json => console.log(json));
    }
}