//Differentiate between playlists and songs, check :40

const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useMainPlayer, useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
    data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Riproduce della musica.')
    .addStringOption((option) =>
        option
            .setName('input')
            .setDescription("Inserisci il nome o l'url del brano da riprodurre.")
            .setRequired(true)
    ),

    async execute(interaction) {
        const player = useMainPlayer()
        const embedcolor = botconfig.color;
        const queue = useQueue(interaction.guildId)
        const channel = interaction.member.voice.channel;

        if (!channel) {
            logger.warn(`C[PLAY] "${interaction.user.username}" tried to play something in "${interaction.guild.name}" but he wasn't in a channel`)
            
            return interaction.reply('Non sei connesso ad un canale vocale!');
         } 

        if ( queue && queue.channel.id !== channel.id) {
            logger.warn(`C[PLAY] "${interaction.user.username}" tried to play something in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
            
            return interaction.reply('Devi essere nello stesso canale vocale del bot!');
        }

        await interaction.deferReply();

        let embed = new EmbedBuilder()
        embed
        .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(embedcolor)

        const query = interaction.options.getString('input', true); 
        
        const searchResult = await player
            .search(query, { requestedBy: interaction.user })
            .catch(() => null);


        if (!searchResult?.hasTracks()) {
            logger.warn(`C[PLAY] "${interaction.user.username}" tried to play "${query}" in "${interaction.guild.name}" but nothing was found`)
            embed
            .setTitle(`${emoji.cross}  Non ho trovato risultati per la tua ricerca...`)
            return interaction.followUp({embeds: [embed]});
        }
            

        try {
            const { track } = await player.play(channel, searchResult, {
                nodeOptions: {
                    metadata: interaction.channel, 
                    leaveOnEnd: true,
                    leaveOnEndCooldown: 120000,
                },
            });

            
            if (!queue) {
                logger.info(`C[PLAY] "${interaction.user.username}" started playing "${track.title}" in "${interaction.guild.name}"`)
                return interaction.deleteReply();
            }

            embed
            .setTitle(`${emoji.check} Aggiunto alla coda`)
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
            .setFooter({ text: `Posizione in coda: ${queue.size}`})
     
            logger.info(`C[PLAY] "${interaction.user.username}" played "${track.title}" in "${interaction.guild.name}"`)

            return interaction.followUp({ embeds : [embed]});
            
        } catch (e) {
            logger.error(`C[PLAY] Something went wrong while playing ${query} in "${interaction.guild.name}"`)
            logger.error(e);

            return interaction.followUp(`Qualcosa è andato storto...`);
        }
    }

}
