const { Events, EmbedBuilder } = require('discord.js');
const logger = require('../../services/logger.js');
const data = require("../../misc/data/users.json")
const emoji = require("../../misc/js/emoji.js")
const botconfig = require("../../misc/js/botconfig.js")

module.exports = {
	name: Events.InteractionCreate,
	async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);
    
        if (!command) return;

        //Embed
        const embedcolor = botconfig.color;
        let embed = new EmbedBuilder
        embed
        .setAuthor({
            name: `${interaction.user.username}`,
            iconURL: `${interaction.user.displayAvatarURL()}`,
        })
        .setColor(embedcolor)

        //Check if user is banned
        let array = data.ban

        if (array.indexOf(interaction.user.id) > -1) {
            embed
            .setDescription(`${emoji.cross}  Sei stato bannato dal bot!`)
            return interaction.reply({embeds : [ embed ]})
        }

        //Execute
        try {
            await command.execute(interaction);
        } catch (e) {
            logger.error(`E[INTERACTION] "${interaction.user.username}" tried to use "${interaction.commandName}" in "${interaction.guild.name}" but something went wrong:`);
            logger.error(e)
        }
	},
};