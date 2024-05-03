const { EmbedBuilder } = require("discord.js")
const logger = require("../../services/logger.js")
const botconfig = require("../../misc/js/botconfig.js")
const emoji = require("../../misc/js/emoji.js")

module.exports = {
    name: "playerStart",
    execute(queue, track) {

        let embed = new EmbedBuilder()

        embed
        .setAuthor({
            name: `${track.requestedBy.username}`,
            iconURL: `${track.requestedBy.displayAvatarURL()}`,
        })
        .setColor(botconfig.color)
        .setTitle(`${emoji.music}  In riproduzione`)
        .setDescription(`Brano: **[${track.title}](${track.url})**`)
        .setThumbnail(track.thumbnail)
        .setFields( [
            {
                name: "Autore",
                value: `${track.author}`,
                inline: true,
            },
            {
                name: "Durata",
                value: `${track.duration}`,
                inline: true,
            },
        ])
            
        logger.info(`E[PLAYERSTART] The bot has started playing "${track.title}" in "${queue.guild.name}"`)

        queue.metadata.send({ embeds: [embed] });
    }
}