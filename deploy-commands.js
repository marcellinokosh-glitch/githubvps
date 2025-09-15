require('dotenv').config();
const { REST, Routes } = require('discord.js');
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.TOKEN;
const fs = require('fs');
const path = require('path');

const commands = [];
const commandesPath = path.join(__dirname, 'commandes');
fs.readdirSync(commandesPath).forEach(categorie => {
    const categoriePath = path.join(commandesPath, categorie);
    fs.readdirSync(categoriePath).forEach(file => {
        if (file.endsWith('.js')) {
            const command = require(path.join(categoriePath, file));
            if (command && command.data && typeof command.data.toJSON === 'function') {
                commands.push(command.data.toJSON());
            }
            // Sinon, ignore (pas une commande slash)
        }
    });
});

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationGuildCommands(clientId, guildId),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
})();