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
  name: "skip",
  description: "Passe à la musique suivante",
  data: new SlashCommandBuilder()
    .setName('skip')
    .setDescription("Passe à la musique suivante"),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const queue = musicQueue.get(interaction.guildId);
    if (!queue.player || queue.queue.length === 0) {
      return interaction.reply({ content: '❌ Aucune musique à passer.', flags: MessageFlags.Ephemeral });
    }
    queue.player.stop();
    await interaction.reply({ content: '⏭️ Musique suivante.', flags: MessageFlags.Ephemeral });
  }
};
