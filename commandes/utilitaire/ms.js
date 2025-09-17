const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const ping = require('../fun/ping');
function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

module.exports = {
    name: "ms",
    description: "Affiche le ping du bot en millisecondes",
    data: new SlashCommandBuilder()
        .setName('ms')
        .setDescription('Affiche le ping du bot en millisecondes'),
    async execute(interaction) {
        const pingValue = Math.round(interaction.client.ws.ping);
        const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const embed = new EmbedBuilder()
            .setTitle('`🏓` Ping du bot')
            .setDescription(`**${pingValue} ms**`)
            .setColor(getEmbedColor())
            .setFooter({ text: `développé par Vicieu • ${heure}` });

        if (typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            await interaction.reply({ embeds: [embed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};