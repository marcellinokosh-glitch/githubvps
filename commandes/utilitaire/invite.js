const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "invite",
    description: "Donne le lien d'invitation du bot.",
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription("Donne le lien d'invitation du bot"),
    async execute(context) {
        const clientId = context.client.user.id;
        const invite = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=8&scope=bot%20applications.commands`;
        return context.reply({ content: `Invite-moi sur ton serveur :\n${invite}` });
    }
};