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
  name: "resume",
  description: "Reprend la lecture de la musique",
  data: new SlashCommandBuilder()
    .setName('resume')
    .setDescription("Reprend la lecture de la musique"),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const queue = musicQueue.get(interaction.guildId);
    if (!queue.player || queue.player.state.status !== 'paused') {
      return interaction.reply({ content: '❌ Aucune musique en pause.', flags: MessageFlags.Ephemeral });
    }
    queue.player.unpause();
    await interaction.reply({ content: '▶️ Musique reprise.', flags: MessageFlags.Ephemeral });
  }
};
