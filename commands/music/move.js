const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("move")
        .setDescription("Sposta un brano in coda")
        .addIntegerOption(option =>
            option.setName('from')
                .setDescription('Numero del brano da spostare')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('to')
                .setDescription('Posizione in cui spostare il brano')
                .setRequired(true)
        ),

    execute: async (interaction) => {
        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guild.id);

        if (!channel) {
            logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but he wasn't in a channel`)
            return interaction.reply('Non sei connesso ad un canale vocale!');
        }

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
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
                logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but there was nothing playing`)
                embed
                .setDescription(
                    `**${emoji.cross}  Non ci sono brani in coda!**`
                )
                return interaction.followUp({ embeds : [ embed ]})
            }

            const from = interaction.options.getInteger('from', true) - 1;
            const to = interaction.options.getInteger('to', true) - 1;

            if (queue.size < 2) {
                logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but there were not enough tracks in queue`)
                embed
                .setDescription(
                    `**${emoji.cross}  Non ci sono abbastanza brani in coda!**`
                )
                return interaction.followUp({ embeds : [ embed ]})
            }

            if (from < 0 || from >= queue.size) {
                embed
                .setDescription(
                    `**${emoji.cross} Il brano indicato nel primo parametro non esiste!**`
                )
                logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but the "from" index was out of range`)
                
                return interaction.followUp({ embeds : [ embed ]});
            }
            
      
            if (to < 0 || to >= queue.size) {
                embed
                .setDescription(
                    `**${emoji.cross}  Il brano indicato nel secondo parametro non esiste!**`
                )
                logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but the "to" index was out of range`)
                
                return interaction.followUp({ embeds : [ embed ]});
            }
      
            if (from === to) {
                embed
                .setDescription(
                    `**${emoji.cross}  La traccia è già in quella posizione!**`
                )
                logger.warn(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but the "from" and "to" indexes were the same`)
                
                return interaction.followUp({ embeds : [ embed ]});
            }
      
            queue.node.move(from, to);

            embed
            .setDescription(
                //appena modificato, possibilmente non funziona
                `**${emoji.check}  Brano spostato!** \n
                ${queue.tracks[from]} è ora in posizione **${to}**`
            )
            logger.info(`C[MOVE] "${interaction.user.username}" moved a track in "${interaction.guild.name}"`)
            return interaction.followUp({ embeds : [ embed ]});

        } catch (e) {
            logger.error(`C[MOVE] "${interaction.user.username}" tried to move a track in "${interaction.guild.name}" but an error occurred`)
            logger.error(e)
            return interaction.followUp(`Qualcosa è andato storto...`)
        }
    }
}