const { Events } = require('discord.js');
const logger = require('../../services/logger.js');
const botconfig = require('../../misc/js/botconfig.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		logger.info(`E[READY] Logged in as ${client.user.tag}`);
		logger.info (`E[READY] Embed color currently set to ${botconfig.color}`)
	},
};