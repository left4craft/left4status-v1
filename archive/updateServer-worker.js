const config = require('../config');
const services = require('../services.json');
const fs = require('fs');
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
    name: 'sendServerStatus',
    run(component, status, data, app) {
        let log = app.log;

        app.db.query(`SELECT * FROM minecraft WHERE id = "${data.server}";`, (err, result) => {
            if (err) return log.error(err);

            /////////////////////////////////
            if (result[0].status == status) return; // stop here if nothing changed
            /////////////////////////////////

            log.console(`${services.minecraft.servers[data.server].name}'s status has changed`)

            app.db.query(`UPDATE minecraft SET status = "${status}" WHERE id = "${data.server}";`, (err, result) => {
                if (err) return log.error(err);
                log.info(`${services.minecraft.servers[data.server].name} ${config.statuses[status].info}`)
            });

            app.db.query(`SELECT * FROM minecraft WHERE id = "${data.server}";`, (err, result) => {
                if (err) return log.error(err);

                // send to statuspage
                fetch(`https://api.statuspage.io/v1/pages/${config.statuspage.page_id}/components/${services.minecraft.servers[data.server].component}`, {
                        method: 'patch',
                        body: JSON.stringify({
                            component: {
                                status: config.statuses[status].code
                            }
                        }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': config.statuspage.api_key
                        },
                    })
                    .then(() => {
                        fetch(`${config.statuspage.public_api}status.json`)
                            .then(res => res.json())
                            .then(json => {
                                let indicator_icon = config.statuspage.indicators[json.status.indicator];
                                let indicator_info = json.status.description;
                                let mins = Math.ceil((Date.now() - result[0].last_online) / (1000 * 60));
                                
                                // webhook embed
                                const embed = new Discord.RichEmbed()
                                    .setAuthor('System wide: ' + indicator_info, `${config.assets}${indicator_icon}.png`, config.statuspage.url)
                                    .setColor(config.statuses[status].colour)
                                    .setTitle(`${services.minecraft.servers[data.server].name}: ${config.statuses[status].title}`)
                                    .setURL(config.statuspage.url)
                                    .setDescription(`The **${services.minecraft.servers[data.server].name}** Minecraft server ${config.statuses[status].info}\n\n`)
                                    .addField("Last Known TPS", data.tps, true)
                                    .addField('Status Page', `[${config.statuspage.pretty_url}](${config.statuspage.url})`, true)
                                    // .addBlankField()
                                    .setFooter("Left4Craft | Status Service", `${config.assets}logo.png`)
                                    .setTimestamp();

                                    if (status == 'partial' || status == 'major' || status == 'maintenance') embed.addField('Last Online', `${mins} ${mins === 1 ? "minute" : "minutes"} ago`, false);

                                let recent = JSON.parse(fs.readFileSync('./recent.json'));
                                // log.warn(((Date.now() - recent.last_pinged) / (1000 * 60)))

                                let message = {
                                    embeds: [embed],
                                    avatarURL: `${config.assets}${status}.png`,
                                    username: config.statuses[status].title
                                };

                                if (((Date.now() - recent.last_pinged) / (1000 * 60)) > 5 || status == "maintenance") {
                                    message.content = `<@&${config.discord.role}>\n\n`;
                                    recent.last_pinged = Date.now();
                                    fs.writeFile("./recent.json", JSON.stringify(recent), (err) => console.error);
                                }

                                // send the message
                                app.hook.send(message);
                            });

                    });
            });


        });

    }
};