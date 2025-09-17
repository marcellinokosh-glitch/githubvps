const { SlashCommandBuilder } = require('discord.js');
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
  name: "queue",
  description: "Affiche la file d'attente de musique",
  data: new SlashCommandBuilder()
    .setName('queue')
    .setDescription("Affiche la file d'attente de musique"),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const queue = musicQueue.get(interaction.guildId);
    if ((!queue.nowPlaying && queue.queue.length === 0)) {
      return interaction.reply({ content: '``❌`` Aucune musique dans la file.', flags: MessageFlags.Ephemeral });
    }
    const embed = new EmbedBuilder()
      .setTitle('🎶 File d\'attente')
      .setColor(getEmbedColor())
      .setDescription(
        (queue.nowPlaying ? `▶️ **En cours :** ${queue.nowPlaying.trackInfo.title}\n` : '') +
        (queue.queue.length > 0
          ? queue.queue.map((t, i) => `${i + 1}. ${t.trackInfo.title}`).join('\n')
          : 'Aucune musique en attente.')
      )
      .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
    await interaction.reply({ embeds: [embed], flags: MessageFlags.Ephemeral });
  }
};
