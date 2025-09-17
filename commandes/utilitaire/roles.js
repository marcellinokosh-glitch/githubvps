const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    name: "roles",
    description: "Liste les rôles du serveur.",
    data: new SlashCommandBuilder()
        .setName('roles')
        .setDescription("Liste les rôles du serveur"),
    async execute(context) {
        const roles = context.guild.roles.cache
            .filter(r => r.id !== context.guild.id)
            .sort((a, b) => b.position - a.position)
            .map(r => r.toString());
        const embed = new EmbedBuilder()
            .setTitle("Rôles du serveur")
            .setDescription(roles.join(' '))
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    }
};