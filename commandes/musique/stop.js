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
  name: "stop",
  description: "Arrête la musique et vide la file d’attente",
  data: new SlashCommandBuilder()
    .setName('stop')
    .setDescription("Arrête la musique et vide la file d’attente"),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const queue = musicQueue.get(interaction.guildId);
    if (!queue.player) {
      return interaction.reply({ content: '❌ Aucune musique en cours.', flags: MessageFlags.Ephemeral });
    }
    queue.queue = [];
    queue.player.stop();
    await interaction.reply({ content: '⏹️ Musique arrêtée et file vidée.', flags: MessageFlags.Ephemeral });
  }
};
