const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    name: "roleinfo",
    description: "Affiche les infos d'un rôle.",
    data: new SlashCommandBuilder()
        .setName('roleinfo')
        .setDescription("Affiche les infos d'un rôle")
        .addRoleOption(opt => opt.setName('role').setDescription('Rôle').setRequired(true)),
    async execute(context) {
        const role = context.options.getRole('role');
        const embed = new EmbedBuilder()
            .setTitle(`Infos du rôle ${role.name}`)
            .addFields(
                { name: "ID", value: role.id, inline: true },
                { name: "Couleur", value: role.hexColor, inline: true },
                { name: "Membres", value: `${role.members.size}`, inline: true },
                { name: "Mentionnable", value: role.mentionable ? "Oui" : "Non", inline: true }
            )
            .setColor(role.color || "#5865F2");
        return context.reply({ embeds: [embed] });
    }
};