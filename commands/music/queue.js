const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")
const buttonPages = require("../../misc/js/buttonPages.js")

module.exports = {
    data: new SlashCommandBuilder()
        .setName("queue")
        .setDescription("Mostra i primi 20 brani in coda!"),

    async execute (interaction){

        const embedcolor = botconfig.color;
        const channel = interaction.member.voice.channel;
        const queue = useQueue(interaction.guild.id);

        if (!channel) {
            logger.warn(`C[QUEUE] "${interaction.user.username}" tried to list queue in "${interaction.guild.name}" but he wasn't in a channel`)
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
                logger.warn(`C[QUEUE] "${interaction.user.username}" tried to list queue in "${interaction.guild.name}" but there was nothing playing`)

                embed
                .setDescription(`**${emoji.cross}  Non ci sono brani in coda!**`)
                return interaction.followUp({ embeds : [ embed ]})
            }


            let page = 1;

            const multiple = 10;
        
            const maxPages = Math.ceil(queue.size / multiple);
        
            if (page < 1 || page > maxPages) page = 1;

            const end = page * multiple;
            const start = end - multiple;
        
            const tracks = queue.tracks.toArray();
            const currentTrack = queue.currentTrack;

            let queueString = tracks.slice(start, end).map((song, i) => {
                return `${i+1}. **${song.duration}** [${song.title}](${song.url}) - ${song.author}`
            }).join("\n")

            embed
            .setDescription(
                `**${emoji.music}  Ora in riproduzione** \n` +
                `[${currentTrack.title}](${currentTrack.url}) - ${currentTrack.author} \n\n ` +

                `${queueString ? "**In lista:** \n " : ""}` +
                queueString
            )
            .setThumbnail(currentTrack.thumbnail)

            function duration(millis) {
                var hours = Math.floor(millis / (1000 * 60 * 60));
                var minutes = Math.floor((millis / (1000 * 60)) % 60);
                var seconds = Math.floor((millis / 1000) % 60);

                hours = (hours < 10 ? '0' + hours : hours) 
                minutes = (minutes < 10 ? '0' + minutes : minutes) 
                seconds = (seconds < 10 ? '0' + seconds : seconds) 

                return (hours === '00' ? '' : hours + ':') + minutes + ":" + seconds;
            }

            const estimated = queue.estimatedDuration;

            let embeds = [];

            logger.info(`C[QUEUE] "${interaction.user.username}" listed queue in "${interaction.guild.name}"`)

            if (estimated) {

                if (maxPages === 1) {
                    embed
                    .setFooter({ text: `Durata lista: ${duration(estimated)}` })
                    return interaction.followUp({ embeds : [ embed ]})
                }

                for (let i = 0; i < maxPages; i++) {

                    const end = page * multiple;
                    const start = end - multiple;
        
                    const tracks = queue.tracks.toArray();
                    const currentTrack = queue.currentTrack;
    
                    embeds[i] = new EmbedBuilder()
    
                    queueString = tracks.slice(start, end).map((song, j) => {
                        return `${j+multiple*(page-1)+1}. **${song.duration}** [${song.title}](${song.url}) - ${song.author}`
                    }).join("\n")
    
                    page++
    
                    embeds[i]
                    .setAuthor({
                        name: `${interaction.user.username}`,
                        iconURL: `${interaction.user.displayAvatarURL()}`,
                    })
                    .setColor(embedcolor)
    
                    .setDescription(
                        `**${emoji.music}  Ora in riproduzione** \n` +
                        `[${currentTrack.title}](${currentTrack.url}) - ${currentTrack.author} \n\n ` +
        
                        `${queueString ? "**In lista:** \n " : ""}` +
                        queueString
                    )
                    .setThumbnail(currentTrack.thumbnail)
                    .setFooter({ text: `Durata lista: ${duration(estimated)} \n Pagina ${page-1}/${maxPages} - Tracce ${start+1}-${end} su ${queue.size}` })
                }
                buttonPages(interaction, embeds);
                
            } else {
                return interaction.followUp({ embeds : [ embed ]})
            }

            
        } catch (e) {
            logger.error(`C[QUEUE] "${interaction.user.username}" tried to list queue in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e);
            return interaction.followUp(`Qualcosa è andato storto...`);
        }
        

    }
}