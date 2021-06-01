# left4status
Left4Craft's status tracker API. Integrates with StatusPage.io and Discord to show server status and performance.

<!--**Don't want to pay $10 for md_5's [BungeeStatus](https://www.spigotmc.org/resources/bungeestatus.708/)?**
This is much cooler and completely free *(if you can set it up - it's not a complete solution)*.-->

- Each server sends an api request to the web server once per minute with player and TPS data to show it is online (Pinger plugin not included)
- If a server does not ping within the expected time (~2 mins, varies depending on last known TPS) it is presumed to be offline
- When a server's status changes, the statuspage.io page is updated (via API), and a notification webhook is sent to Discord
- Discord webhook only pings once per 5 mins (no matter how many messages are sent)
- Can also submit metrics (player count or TPS) to statuspage
- Also monitors websites by pinging them (pretty much the reverse of the server status system)
- Services are in JSON, easy to add/edit/remove
- Can also monitor external services such as Discord API and Mojang auth servers (fetches data from Mojang's and Discord's own statuspages/APIs)
- JSON API (servers post/get to `/updateServer/servername` (requires api key to update), and other services such as a [Discord bot](https://github.com/Left4Craft/left4bot/) can get from `/summary` or `/status/[minecraft/website/external]`)
