const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

const UPTIME_FILE = path.join(__dirname, '..', '..', 'uptime_channel.json');
const OWNER_ID = '1052956303720456313';

module.exports = {
  name: "setupuptime",
  description: "Configure le système d’uptime du bot (owner uniquement)",
  data: new SlashCommandBuilder()
    .setName('setupuptime')
    .setDescription("Configure le système d’uptime du bot (owner uniquement)")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interaction) {
    const userId = interaction.user?.id || interaction.author?.id;
    const isSlash = typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand();

    if (userId !== OWNER_ID) {
      const embed = new EmbedBuilder()
        .setTitle('⛔ Accès refusé')
        .setDescription("Tu n'as pas la permission d'utiliser cette commande.")
        .setColor(0xED4245);
      if (isSlash) {
        return interaction.reply({ embeds: [embed], flags: 64 });
      } else {
        return interaction.reply({ embeds: [embed] });
      }
    }

    // Cherche un salon nommé "uptime"
    let channel = interaction.guild.channels.cache.find(ch => ch.name === 'uptime' && ch.type === 0);
    if (!channel) {
      channel = await interaction.guild.channels.create({
        name: 'uptime',
        type: 0, // 0 = GUILD_TEXT
        reason: 'Salon uptime pour les annonces du bot'
      });
    }

    // Sauvegarde l'ID du salon dans un fichier
    fs.writeFileSync(UPTIME_FILE, JSON.stringify({ channelId: channel.id }, null, 2));

    // Embed principal comme au lancement du bot
    const mainEmbed = new EmbedBuilder()
      .setTitle('✅ Redémarrage terminé')
      .setDescription('Le bot a bien redémarré et est opérationnel !')
      .setColor(getEmbedColor())
      .setTimestamp()
      .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });

    // Envoie l'embed dans le salon uptime
    await channel.send({ embeds: [mainEmbed] });

    // Réponse à l'utilisateur
    const confirmEmbed = new EmbedBuilder()
      .setTitle('✅ Salon uptime configuré')
      .setDescription(`Salon <#${channel.id}> configuré pour l'uptime !`)
      .setColor(getEmbedColor())
      .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
    if (isSlash) {
      await interaction.reply({ embeds: [confirmEmbed], flags: 64 });
    } else {
      await interaction.reply({ embeds: [confirmEmbed] });
    }
  },
  help: false // Pour ne pas l'afficher dans le help
};