const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("loop")
        .setDescription("Mette in loop la coda")
        .addStringOption(option =>
            option
            .setName('type')
            .setDescription('Il tipo di loop')
            .setRequired(false)
            .addChoices(
                {name: `Off`, value: `0`},
                {name: `Track`, value: `1`},
                {name: `Queue`, value: `2`},
                {name: `Autoplay`, value: `3`}
            )),

    async execute (interaction) {
        
        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guildId)

        if (!channel) {
            logger.warn(`C[LOOP] "${interaction.user.username}" tried to loop something in "${interaction.guild.name}" but he wasn't in a channel`)   
            return interaction.reply('Non sei connesso ad un canale vocale!');
        }

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[LOOP] "${interaction.user.username}" tried to loop something in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
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
                logger.warn(`C[LOOP] "${interaction.user.username}" tried to loop something in "${interaction.guild.name}" but there was nothing playing`)

                embed
               .setDescription(
                    `**${emoji.cross}  Non ci sono brani in coda!**`
                )
                return interaction.followUp({ embeds : [ embed ]})
            }

            const setLoop = interaction.options.getString('type')
            const loop = queue.repeatMode
            let name
            switch (setLoop || loop) {
                case `0`:
                    name = `Off`
                    break
                case `1`:
                    name = `Track`
                    break
                case `2`:
                    name = `Queue`
                    break
                case `3`:
                    name = `Autoplay`
                    break
            }

            if (!interaction.options.getString('type')) {
                embed
                .setDescription(
                    `**${emoji.info}  Loop impostato su ${name}!**`
                )
                logger.info(`C[LOOP] "${interaction.user.username}" checked loop status in "${interaction.guild.name}"`)
                return interaction.followUp({ embeds : [ embed ]})
            }

            queue.setRepeatMode(setLoop);

            embed
            .setDescription(
                `**${emoji.check}  Loop impostato su ${name}!**`
            )
            logger.info(`C[LOOP] "${interaction.user.username}" set the loop to ${name} in "${interaction.guild.name}"`)
            return interaction.followUp({ embeds : [embed]})
        } catch (e) {
            logger.error(`C[LOOP] "${interaction.user.username}" tried to loop something in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e);
            return interaction.followUp(`Qualcosa è andato storto...`);
        }
        

    }
}