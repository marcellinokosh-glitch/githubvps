const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ms')
        .setDescription('Affiche le ping du bot en millisecondes'),
    async execute(interaction) {
        const ping = Math.round(interaction.client.ws.ping);
        const embed = new EmbedBuilder()
            .setTitle('🏓 Ping du bot')
            .setDescription(`**${ping} ms**`)
            .setColor(0x5865F2);

        if (typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            await interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};