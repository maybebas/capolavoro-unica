const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clear")
        .setDescription("Azzera la coda"),

    async execute (interaction) {
        
        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guild.id);
        
        if (!channel) {
            logger.warn(`C[CLEAR] "${interaction.user.username}" tried to clear queue in "${interaction.guild.name}" but he wasn't in a channel`)
            return interaction.reply('Non sei connesso ad un canale vocale!');
        }

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[CLEAR] "${interaction.user.username}" tried to clear queue in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
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
                logger.warn(`C[CLEAR] "${interaction.user.username}" tried to clear queue in "${interaction.guild.name}" but there was nothing playing`)
                embed
                .setDescription(
                    `**${emoji.cross}  Non ci sono brani in coda!**`
                )
                return interaction.followUp({ embeds : [ embed ]})
            }

            queue.clear()

            embed
            .setDescription(
                `**${emoji.check}  Coda azzerata!**`
            )
            
            logger.info(`C[CLEAR] "${interaction.user.username}" cleared queue in "${interaction.guild.name}"`)
            return interaction.followUp({ embeds : [embed]})
        } catch (e) {
            logger.error(`C[CLEAR] "${interaction.user.username}" tried to clear queue in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e);
            return interaction.followUp(`Qualcosa è andato storto...`);
        }
        

    }
}