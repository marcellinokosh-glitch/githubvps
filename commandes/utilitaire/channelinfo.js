const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');
module.exports = {
    name: "channelinfo",
    description: "Affiche les infos d'un salon.",
    data: new SlashCommandBuilder()
        .setName('channelinfo')
        .setDescription("Affiche les infos d'un salon")
        .addChannelOption(opt => opt.setName('salon').setDescription('Salon').setRequired(true)),
    async execute(context) {
        const channel = context.options.getChannel('salon');
        const embed = new EmbedBuilder()
            .setTitle(`Infos du salon #${channel.name}`)
            .addFields(
                { name: "ID", value: channel.id, inline: true },
                { name: "Type", value: `${channel.type}`, inline: true },
                { name: "Créé le", value: `<t:${Math.floor(channel.createdTimestamp/1000)}:f>`, inline: true }
            )
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    }
};