//FIXME non funziona propruro

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const emoji = require('../../misc/js/emoji');
const botconfig = require('../../misc/js/botconfig');
const data = require("../../misc/data/users.json")

module.exports = {
	data: new SlashCommandBuilder()
		.setName('reload')
		.setDescription('Reloads a command.')
		.addStringOption(option =>
			option.setName('command')
				.setDescription('Il comando da ricaricare')
				.setRequired(true)),

    async execute(interaction) {

		const embedcolor = botconfig.color;
		await interaction.deferReply()

		let embed = new EmbedBuilder()

		embed
		.setAuthor({
			name: `${interaction.user.username}`,
			iconURL: `${interaction.user.displayAvatarURL()}`,
		})
		.setColor(embedcolor)

        if (data.admin.indexOf(interaction.user.id) == -1) {
            embed
            .setDescription(`${emoji.cross}  Non hai il permesso di usare questo comando!`)
            return interaction.followUp({ embeds: [ embed ] })
        }

        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
			embed
			.setDescription(`**${emoji.cross}  Non c'è nessun comando con il nome \`${commandName}\`!**`)
            return interaction.followUp({ embeds : [ embed ]});
        }

		const commandFolders = fs.readdirSync('./commands');
		const folderName = commandFolders.find(folder => fs.readdirSync(`./commands/${folder}`).includes(`${commandName}.js`));

        delete require.cache[require.resolve(`../${folderName}/${command.data.name}.js`)];

        try {
        	interaction.client.commands.delete(command.data.name);
        	const newCommand = require(`../${folderName}/${command.data.name}.js`);
        	interaction.client.commands.set(newCommand.data.name, newCommand);

			embed
			.setDescription(`**${emoji.check}  Il comando \`${newCommand.data.name}\` è stato ricaricato!**`)

        	await interaction.followUp({ embeds : [ embed ]});
        } catch (error) {
        	console.error(error);

			embed
			.setDescription(`**${emoji.cross}  C'è stato un errore durante il ricaricamento del comando \`${command.data.name}\`:\n\`${error.message}\`**`)
        	
			await interaction.followUp({ embeds : [ embed ]});
        }
    },
};