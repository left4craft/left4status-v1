const pkg = require('../package.json');

module.exports = {
    method: 'get',
    path: '/api/',
    name: 'api-index',
    execute(req, res, app) {
        app.log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);

        res.writeHead(200);
        res.write(`200 OK\n\nLeft4Craft Status Service API\nMade by eartharoid\n
Node Version: ${process.version}
API Version: ${pkg.version}\n`);

        res.write(`\n\nThank you to Google Cloud for providing free hosting.`)
        res.end();
    }
};