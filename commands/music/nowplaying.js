const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useMainPlayer, useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Mostra il brano attualmente in riproduzione!"),

  async execute(interaction) {

    const embedcolor = botconfig.color;
    const channel = interaction.member.voice.channel;
    const queue = useQueue(interaction.guildId)

    if (!channel) {
      logger.warn(`C[NOWPLAYING] "${interaction.user.username}" tried to list current track in "${interaction.guild.name}" but he wasn't in a channel`)
      return interaction.reply('Non sei connesso ad un canale vocale!');
    } 

    if ( queue && queue.channel.id !== channel.id) {
      logger.warn(`C[NOWPLAYING] "${interaction.user.username}" tried to list current track in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
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

    if (!queue) {
      logger.warn(`C[NOWPLAYING] "${interaction.user.username}" tried to list current track in "${interaction.guild.name}" but there was nothing playing`)
      embed
      .setDescription(
        `**${emoji.cross}  Non ci sono brani in coda!**`
      )
      return interaction.followUp({ embeds : [ embed ]})
    }


    try {

      const currentTrack = queue.currentTrack;

      embed
      .setDescription(
        `**${emoji.music}  Now Playing** \n` +
        `[${currentTrack.title}](${currentTrack.url}) - ${currentTrack.author} \n\n ` +
        `**${queue.node.createProgressBar()}**`

      )
      .setFooter({
        text: `Richiesto da ${interaction.user.username}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      })

      logger.info(`C[NOWPLAYING] "${interaction.user.username}" listed current track in "${interaction.guild.name}"`)

      return interaction.followUp({ embeds : [ embed ]});

    } catch (e) {
      logger.error(`C[NOWPLAYING] "${interaction.user.username}" tried to list current track in "${interaction.guild.name}" but something went wrong:`);
      logger.error(e);
      return interaction.followUp(`Qualcosa è andato storto...`);
    }



  }
}