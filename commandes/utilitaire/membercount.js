const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "membercount",
    description: "Affiche le nombre de membres du serveur.",
    data: new SlashCommandBuilder()
        .setName('membercount')
        .setDescription("Affiche le nombre de membres du serveur"),
    async execute(context) {
        return context.reply({ content: `👥 Membres : **${context.guild.memberCount}**` });
    }
};