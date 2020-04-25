const log = require('leekslazylogger');
const config = require('../config');
const pkg = require('../package.json');

module.exports = {
    method: 'get',
    path: '/',
    name: 'index',
    execute(req, res, app) {
        log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);
        log.console(`Redirecting visitor of '/' to '${config.statuspage.url}'`)
        res.redirect(301, config.statuspage.url);
    }
};