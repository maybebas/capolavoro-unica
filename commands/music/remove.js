const { EmbedBuilder, SlashCommandBuilder } = require("discord.js")
const { useMainPlayer, useQueue } = require("discord-player")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")
const logger = require("../../services/logger.js")

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove")
    .setDescription("Rimuovi una canzone dalla coda.")
    .addIntegerOption((option) =>
      option
        .setName("index")
        .setDescription("The track index to remove")
        .setRequired(true)
    ),

  async execute(interaction) {
    
    const embedcolor = botconfig.color;
    const channel = interaction.member.voice.channel;
    const queue = useQueue(interaction.guildId)

    if (!channel) {
      logger.warn(`C[REMOVE] "${interaction.user.username}" tried to remove a track from queue in "${interaction.guild.name}" but he wasn't in a channel`)
      return interaction.reply('Non sei connesso ad un canale vocale!');
    } 

    if ( queue && queue.channel.id !== channel.id) {
      logger.warn(`C[REMOVE] "${interaction.user.username}" tried to remove a track from queue in "${interaction.guild.name}" but he wasn't in the same channel as the bot`)
      return interaction.reply('Devi essere nello stesso canale vocale del bot!');
    }

    await interaction.deferReply();

    try {

      const index = interaction.options.getInteger('index', true) - 1;

      let embed = new EmbedBuilder()

      embed
      .setAuthor({
        name: `${interaction.user.username}`,
        iconURL: `${interaction.user.displayAvatarURL()}`,
      })
      .setColor(embedcolor)

      if (!queue) {
        logger.warn(`C[REMOVE] "${interaction.user.username}" tried to remove a track from queue in "${interaction.guild.name}" but there was nothing playing`)
        embed
        .setDescription(
          `**${emoji.cross}  Non ci sono brani in coda!**`
        )
        return interaction.followUp({ embeds : [ embed ]})
      }

      if (index > queue.size || index < 0 || index === queue.size) {

        embed
        .setDescription(
          `**${emoji.cross}  Il brano indicato non esiste!**`
        )

        logger.warn(`C[REMOVE] "${interaction.user.username}" tried to remove a track from queue in "${interaction.guild.name}" but the index was out of range`)
        return interaction.followUp({ embeds : [ embed ]});
      }

      queue.node.remove(index);

      embed
      .setDescription(
        `**${emoji.check}  Brano rimosso!**`
      )

      return interaction.followUp({ embeds : [ embed ]});


    } catch (e) {
      logger.error(`C[REMOVE] "${interaction.user.username}" tried to remove a track from queue in "${interaction.guild.name}" but something went wrong:`);
      logger.error(e);
      return interaction.followUp(`Qualcosa è andato storto...`);
    }


  }
}