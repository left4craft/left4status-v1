module.exports = {
    keys: ['development'],
    ping_interval: 3,
    port: 8000,
    keys: ['secret'],
    statuspage: {
        url: 'https://left4craft.statuspage.io/',
        public_api: 'https://left4craft.statuspage.io/api/v2/', // MUST include trailing /
        pretty_url: 'status.left4craft.org',
        page_id: 'jp6z181cyytx',
        api_key: 'api key from manage.statuspage.io',
        indicators: {
            none: 'operational',
            minor: 'degraded',
            major: 'partial',
            critical: 'major'
        }
    },
    minecraft: {
        degraded: 15, // if TPS drops below this, mark server as degraded
        partial: 10, // if TP drops below, mark server as partial outage
    },
    discord: {
        webhook: {
            id: '701035294740447302',
            token: 'secret token from discord app'
        },
        role: '701904205144653886',
        status_cat_id: '697518406013812837',
        status_chan_id: '701035082240229477',
        status_chan_desc: `:green_square:   \n:white_small_square:  https://status.left4craft.org   \n:white_small_square:  Type **!status** in #bots   \n:white_small_square:  Use **!subscribe status** to get notifications`
    },
    assets: 'https://status.left4craft.org/img/', // MUST include trailing /
    statuses: {
        operational: {
            title: 'Operational',
            info: 'is now operational',
            code: 'operational',
            colour: '#4CAF50'
        },
        degraded: {
            title: 'Degraded performance',
            info: 'is suffering from degraded performance',
            code: 'degraded_performance',
            colour: '#F1C40F'
        },
        partial: {
            title: 'Partial outage',
            info: 'may be offline or unreachable',
            code: 'partial_outage',
            colour: '#E67E22'
        },
        major: {
            title: 'Major outage',
            info: 'is offline',
            code: 'major_outage',
            colour: '#E74C3C'
        },
        maintenance: {
            title: 'Maintenance',
            info: 'is under maintenance',
            code: 'under_maintenance',
            colour: '#3498DB'
        }
    }
}
