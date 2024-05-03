const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js");
const botconfig = require("../../misc/js/botconfig.js");
const logger = require("../../services/logger.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stop")
        .setDescription("Interrompi la riproduzione"),

    execute: async (interaction) => {

        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guild.id);

        if (!channel) {
            logger.warn(`C[STOP] "${interaction.user.username}" tried to stop something in "${interaction.guild.name}" but he wasn't in a channel`)
            return interaction.reply('Non sei connesso ad un canale vocale!');
        }

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[STOP] "${interaction.user.username}" tried to stop something in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
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
        
            if (!queue || !queue.node.isPlaying()) {
                embed
                .setDescription(
                    `**${emoji.cross}  Non c'è musica attualmente in riproduzione!**`
                )
                logger.warn(`C[STOP] "${interaction.user.username}" tried to stop something in "${interaction.guild.name}" but there was nothing playing`)
                return interaction.followUp({ embeds : [ embed ]})
            }

            if (!queue.deleted) queue.delete();

            embed
            .setDescription(
				`**${emoji.check}  Riproduzione interrotta con successo!**`
            )
            
            logger.info(`C[STOP] "${interaction.user.username}" stopped the queue in "${interaction.guild.name}"`)
            return interaction.followUp({ embeds : [embed]})
            
        } catch (e) {
            logger.error(`C[STOP] "${interaction.user.username}" tried to stop something in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e);
            return interaction.followUp(`Qualcosa è andato storto...`);
        }
        

    }
}