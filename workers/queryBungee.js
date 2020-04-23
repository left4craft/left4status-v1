const query = require('minecraft-server-util');
const config = require('../config');
const services = require('../services.json');

module.exports = {
    name: 'queryBungee',
    run(app) {
        let log = app.log;

        log.info(`Querying ${services.minecraft.servers.proxy.name}...`);

        query(services.minecraft.servers.proxy.host, services.minecraft.servers.proxy.port)
            .then((res) => {
                // console.log(res);
                log.console(`${services.minecraft.servers.proxy.name} is ${log.colour.greenBright(`online with ${res.onlinePlayers} ${res.onlinePlayers === 1 ? "player" : "players"}`)}`);

                app.workers.updateServer.run(app, {
                    server: 'proxy',
                    player_count: res.onlinePlayers,
                    players: [],
                    tps: 20
                }); // server is online
            })
            .catch((err) => {
                // throw err;
                log.warn(`${services.minecraft.servers.proxy.name} did not respond`);
            });
    }
}