const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("skip")
        .setDescription("Salta il brano corrente"),

    execute: async (interaction) => {

        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guild.id);

        if (!channel) {
            logger.warn(`C[SKIP] "${interaction.user.username}" tried to skip track in "${interaction.guild.name}" but he wasn't in a channel`)
            return interaction.reply('Non sei connesso ad un canale vocale!');
        }

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[REMOVE] "${interaction.user.username}" tried to remove a track from queue in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
            return interaction.reply('Devi essere nello stesso canale vocale del bot!');
        }

        await interaction.deferReply();

        try {

            let embed = new EmbedBuilder()

            embed
			.setAuthor({
				name: `${interaction.user.username}`,
				iconURL: `${interaction.user.displayAvatarURL()}`,
			})
			.setColor(embedcolor)
            
            if (!queue) {
                logger.warn(`C[SKIP] "${interaction.user.username}" tried to skip track in "${interaction.guild.name}" but there was nothing playing`)
                embed
                .setTitle(
                    `**${emoji.cross}  Non ci sono brani in coda!**`
                )
                return interaction.followUp({ embeds : [ embed ]})
            }


            const tracks = queue.tracks.toArray()


            if (tracks[0] === undefined) {
                queue.node.skip()

                embed
                .setTitle(
                    `**${emoji.play}  Brano saltato!**`
                )
                
                logger.info(`C[SKIP] "${interaction.user.username}" skipped track in "${interaction.guild.name}"`)
                return interaction.followUp({ embeds : [ embed ]})
            }

            queue.node.skip()

            const currentTrack = queue.currentTrack

            embed
            .setTitle(`**${emoji.play}  Brano saltato!**`)
            .setDescription(
                `**${currentTrack.duration}**. ` +
                `[${currentTrack.title}](${currentTrack.url}) - ${currentTrack.author} \n\n `
            )
            .setThumbnail(currentTrack.thumbnail)

            logger.info(`C[SKIP] "${interaction.user.username}" skipped track in "${interaction.guild.name}"`)
            return interaction.followUp({ embeds : [embed]})

            
        } catch (e) {
            logger.error(`C[SKIP] "${interaction.user.username}" tried to skip track in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e);

            return interaction.followUp(`Qualcosa è andato storto...`);
        }
        

    }
}