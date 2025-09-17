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
  name: "volume",
  description: "Change le volume du bot",
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription("Change le volume du bot"),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const volume = interaction.options.getInteger('pourcentage');
    if (volume < 1 || volume > 200) {
      return interaction.reply({ content: '❌ Le volume doit être entre 1 et 200.', flags: MessageFlags.Ephemeral });
    }
    const queue = musicQueue.get(interaction.guildId);
    if (!queue.player) {
      return interaction.reply({ content: '❌ Aucune musique en cours.', flags: MessageFlags.Ephemeral });
    }
    queue.volume = volume / 100;
    // Le volume sera appliqué au prochain morceau (play-dl ne permet pas de changer le volume en live sur la ressource)
    await interaction.reply({ content: `🔊 Volume réglé à ${volume}%.`, flags: MessageFlags.Ephemeral });
  }
};
