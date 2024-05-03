const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("pause")
        .setDescription("Ferma o riprende la coda"),

    async execute (interaction) {

        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guildId)

        if (!channel) {
            logger.warn(`C[PAUSE] "${interaction.user.username}" tried to pause something in "${interaction.guild.name}" but he wasn't in a channel`)
            return interaction.reply('Non sei connesso ad un canale vocale!');
        }

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[PAUSE] "${interaction.user.username}" tried to pause something in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
            return interaction.reply('Devi essere nello stesso canale vocale del bot!');
        }

        // let's defer the interaction as things can take time to process
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
                embed
                .setDescription(
                    `**${emoji.cross}  Non c'è musica attualmente in riproduzione!!**`
                )
                
                logger.warn(`C[PAUSE] "${interaction.user.username}" tried to pause something in "${interaction.guild.name}" but there was nothing playing`)
                return interaction.followUp({ embeds : [ embed ]})
            }

            queue.node.setPaused(!queue.node.isPaused()) 
            const state = queue.node.isPaused()

            embed
            .setDescription(
                `${state
                ? `${emoji.pause}  Coda fermata`
                : `${emoji.play}  Coda ripresa`}`
            )
            
            logger.info(`C[PAUSE] "${interaction.user.username}" ${state ? 'paused' : 'resumed'} the queue in "${interaction.guild.name}"`)

            return interaction.followUp({ embeds : [embed]})
        } catch (e) {
            // let's return error if something failed
            logger.error(`C[PAUSE] "${interaction.user.username}" tried to pause something in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e);

            return interaction.followUp(`Qualcosa è andato storto...`);
        }
        

    }
}