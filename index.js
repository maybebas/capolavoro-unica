//Imports
const fs = require('node:fs');
const path = require('node:path');

const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { Player } = require("discord-player");

//dotEnv
require("dotenv").config();

const token = process.env.CLIENT_TOKEN;

//Client
global.client = new Client({
    intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildVoiceStates,
		GatewayIntentBits.MessageContent,
		GatewayIntentBits.GuildMembers,
    ]
});

//Voice Player
global.player = new Player(client, {
    ytdlOptions: {
		requestOptions: { agent },
        quality: "highestaudio",
        highWaterMark: 1 << 25
    }
});

player.extractors.loadDefault()

//Command Handling
client.commands = new Collection();
const commandFoldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandFoldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(commandFoldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

//Event Handling
const eventsFolderPath = path.join(__dirname, 'events');
const eventFolders = fs.readdirSync(eventsFolderPath);

for (const folder of eventFolders) {
	const eventsPath = path.join(eventsFolderPath, folder);
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));
	for (const file of eventFiles) {
		const filePath = path.join(eventsPath, file);
		const event = require(filePath);
		
		let type = "client";
		
		if (file.includes("player.")) {
			type = "player";
		}

		if (type === "player") {
			const { useMainPlayer } = require("discord-player");
			const player = useMainPlayer();
			player.events.on(event.name, (...args) => event.execute(...args));
		} else if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
 		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
}

//Login
client.login(token)