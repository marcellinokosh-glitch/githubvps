const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

module.exports = {
  name: "uptime",
  description: "Affiche depuis combien de temps le bot est en ligne",
  data: new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('Affiche depuis combien de temps le bot est en ligne'),
  async execute(interaction) {
    const uptime = formatUptime(interaction.client.uptime);
    const heure = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const embed = new EmbedBuilder()
      .setTitle('`⏱️` Uptime du bot')
      .setDescription(`Le bot est en ligne depuis : **${uptime}**`)
      .setColor(getEmbedColor())
      .setFooter({ text: `développé par Vicieu • ${heure}` });
  const { MessageFlags } = require('discord.js');
  await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
