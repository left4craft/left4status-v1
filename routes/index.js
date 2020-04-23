const log = require('leekslazylogger');
const config = require('../config');
const pkg = require('../package.json');

module.exports = {
    method: 'get',
    path: '/api/',
    name: 'index',
    execute(req, res, app) {
        log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);

        res.writeHead(200);
        res.write(`200 OK\n\nLeft4Craft Status Service\nMade by eartharoid\n
Node Version: ${process.version}
API Version: ${pkg.version}\n`);

        res.write(`\n\nThank you to Illinois University for providing free hosting.`)
        res.end();
    }
};