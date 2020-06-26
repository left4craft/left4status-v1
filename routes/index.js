module.exports = {
    method: 'get',
    path: '/',
    name: 'index',
    execute(req, res, app) {
        app.log.console(`[HTTP] ${this.method.toUpperCase()} ${this.name}`);
        app.log.console(`Redirecting visitor of '/' to '${app.config.statuspage.url}'`);
        res.redirect(301, app.config.statuspage.url);
    }
};