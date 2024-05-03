const { EmbedBuilder } = require("discord.js")
const logger = require("../../services/logger.js")
const botconfig = require("../../misc/js/botconfig.js")
const emoji = require("../../misc/js/emoji.js")

module.exports = {
    name: "disconnect",
    execute(queue) {

        let embed = new EmbedBuilder()

        embed
        .setColor(botconfig.color)
        .setTitle(`${emoji.check}  Disconnesso`)

        logger.info(`E[DISCONNECT] The bot has been disconnected from the voice channel in "${queue.guild.name}"`)

        queue.metadata.send({ embeds: [embed] });
    }
}