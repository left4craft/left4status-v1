const services = require('../services.json');
const fs = require('fs');
const fetch = require('node-fetch');
const Discord = require('discord.js');

module.exports = {
    name: 'sendServerStatus',
    run(status, data, app) {
        app.db.query('SELECT status FROM minecraft WHERE id=?;', [data.server], (err, result) => {
            if (err) return app.log.error(err);
            /////////////////////////////////
            if (result[0].status == status) return; // stop here if nothing changed
            /////////////////////////////////

            app.log.console(`${services.minecraft.servers[data.server].name}'s status has changed`)

            app.db.query('UPDATE minecraft SET status=? WHERE id=?;', [status, data.server], (err, result) => {
                if (err) return app.log.error(err);
                app.log.info(`${services.minecraft.servers[data.server].name} ${app.config.statuses[status].info}`);

                app.db.query('SELECT last_online FROM minecraft WHERE id=?', [data.server], (err, result) => {
                    if (err) return app.log.error(err);

                    // send to statuspage
                    fetch(`https://api.statuspage.io/v1/pages/${app.config.statuspage.page_id}/components/${services.minecraft.servers[data.server].component}`, {
                        method: 'patch',
                        body: {
                            component: {
                                status: app.config.statuses[status].code
                            }
                        },
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': app.config.statuspage.api_key
                        },
                    });
                    let mins = Math.ceil((Date.now() - result[0].last_online) / (1000 * 60));

                    // webhook embed
                    const embed = new Discord.RichEmbed()
                        .setAuthor(app.config.statuses[status].title, `${app.config.assets}${status}.png`, app.config.statuspage.url)
                        .setColor(app.config.statuses[status].colour)
                        .setTitle(`${services.minecraft.servers[data.server].name}: ${app.config.statuses[status].title}`)
                        .setURL(app.config.statuspage.url)
                        .setDescription(`The **${services.minecraft.servers[data.server].name}** Minecraft server ${app.config.statuses[status].info}\n\n`)
                        // .addBlankField()
                        .setFooter('Left4Craft | Status Service', `${app.config.assets}logo.png`)
                        .setTimestamp();

                    if (data.server !== 'proxy') embed.addField('Last Known TPS', data.tps, true);
                    if (status == 'partial' || status == 'major' || status == 'maintenance') embed.addField('Last Online', `${mins} ${mins === 1 ? 'minute' : 'minutes'} ago`, true);
                    embed.addField('Status Page', `[${app.config.statuspage.pretty_url}](${app.config.statuspage.url})`, true)

                    let recent = JSON.parse(fs.readFileSync('./recent.json'));
                    // log.warn(((Date.now() - recent.last_pinged) / (1000 * 60)))

                    let message = {
                        content: "",
                        embeds: [embed],
                        avatarURL: `${app.config.assets}${status}.png`,
                        username: app.config.statuses[status].title
                    };

                    if ((((Date.now() - recent.last_pinged) / (1000 * 60)) > 5) || status === 'maintenance') {
                        message.content = `<@&${app.config.discord.role}>\n\n`;
                        recent.last_pinged = Date.now();
                        fs.writeFile('./recent.json', JSON.stringify(recent), (err) => console.error);
                    }

                    // send the message
                    app.hook.send(message.content, message);
                });
            });
        });
    }
};
