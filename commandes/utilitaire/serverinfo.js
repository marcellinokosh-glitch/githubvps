const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "serverinfo",
    description: "Affiche les infos du serveur.",
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription("Affiche les infos du serveur"),
    async execute(context) {
        const guild = context.guild;
        const embed = new EmbedBuilder()
            .setTitle(`Infos du serveur ${guild.name}`)
            .setThumbnail(guild.iconURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: "ID", value: guild.id, inline: true },
                { name: "Propriétaire", value: `<@${guild.ownerId}>`, inline: true },
                { name: "Membres", value: `${guild.memberCount}`, inline: true },
                { name: "Créé le", value: `<t:${Math.floor(guild.createdTimestamp/1000)}:f>`, inline: true }
            )
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    }
};