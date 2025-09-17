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
  name: "pause",
  description: "Met la musique en pause",
  data: new SlashCommandBuilder()
    .setName('pause')
    .setDescription("Met la musique en pause"),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const queue = musicQueue.get(interaction.guildId);
    if (!queue.player || queue.player.state.status !== 'playing') {
      return interaction.reply({ content: '❌ Aucune musique en cours.', flags: MessageFlags.Ephemeral });
    }
    queue.player.pause();
    await interaction.reply({ content: '⏸️ Musique en pause.', flags: MessageFlags.Ephemeral });
  }
};
