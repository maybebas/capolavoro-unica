const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
require("dotenv").config()

let commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(commandsPath)
for (const dir of commandFolders) {
    const commandFiles = fs
      .readdirSync(`${commandsPath}/${dir}`)
      .filter((file) => file.endsWith('.js'));
      
      for (const file of commandFiles) {
        const command = require(`${commandsPath}/${dir}/${file}`);
        commands.push(command.data.toJSON());
      }
    }

const rest = new REST({ version: '10' }).setToken(process.env.CLIENT_TOKEN);

rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands })
	.then(() => console.log(`Successfully registered ${commands.length} commands.`))
	.catch(console.error);