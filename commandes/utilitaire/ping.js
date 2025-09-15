const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Vérifie si le bot répond'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong !')
            .setColor(0x5865F2);

        if (typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            await interaction.reply({ embeds: [embed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};