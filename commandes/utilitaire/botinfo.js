const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    name: "botinfo",
    description: "Affiche les infos du bot.",
    data: new SlashCommandBuilder()
        .setName('botinfo')
        .setDescription("Affiche les infos du bot"),
    async execute(context) {
        const client = context.client;
        const embed = new EmbedBuilder()
            .setTitle("Infos du bot")
            .setThumbnail(client.user.displayAvatarURL({ dynamic: true }))
            .addFields(
                { name: "Nom", value: client.user.tag, inline: true },
                { name: "ID", value: client.user.id, inline: true },
                { name: "Serveurs", value: `${client.guilds.cache.size}`, inline: true },
                { name: "Utilisateurs", value: `${client.users.cache.size}`, inline: true },
                { name: "Uptime", value: `<t:${Math.floor((Date.now() - client.uptime)/1000)}:R>`, inline: true }
            )
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    }
};