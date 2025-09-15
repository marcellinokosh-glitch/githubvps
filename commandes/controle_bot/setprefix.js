const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const GuildConfig = require('../configuration_serveur/guildConfig');

module.exports = {
  name: 'setprefix',
  description: 'Définit ou affiche le préfixe du bot pour ce serveur',
  category: 'controle_bot',
  async execute(message, args) {
    // Permission admin requise
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('❌ Vous devez être administrateur pour changer le préfixe.');
      return message.reply({ embeds: [embed] });
    }

    // Afficher le préfixe actuel si aucun argument
    if (!args[0]) {
      let prefix = '!';
      try {
        const config = await GuildConfig.findOne({ guildId: message.guild.id });
        if (config && config.prefix) prefix = config.prefix;
      } catch {}
      const embed = new EmbedBuilder()
        .setColor('Blue')
        .setDescription(`🔎 Le préfixe actuel est : \`${prefix}\``);
      return message.reply({ embeds: [embed] });
    }

    const newPrefix = args[0];
    // Validation avancée
    if (newPrefix.length > 5 || /[\s@#<>`]/.test(newPrefix)) {
      const embed = new EmbedBuilder()
        .setColor('Orange')
        .setDescription('⚠️ Préfixe invalide. 1-5 caractères, pas d’espace ni de caractères spéciaux (@, #, <, >, `).');
      return message.reply({ embeds: [embed] });
    }

    try {
      const oldConfig = await GuildConfig.findOne({ guildId: message.guild.id });
      const oldPrefix = oldConfig && oldConfig.prefix ? oldConfig.prefix : '!';
      await GuildConfig.findOneAndUpdate(
        { guildId: message.guild.id },
        { prefix: newPrefix },
        { upsert: true, new: true }
      );
      const embed = new EmbedBuilder()
        .setColor('Green')
        .setTitle('Préfixe modifié')
        .setDescription(`Ancien préfixe : \`${oldPrefix}\`\nNouveau préfixe : \`${newPrefix}\``);
      return message.reply({ embeds: [embed] });
    } catch (err) {
      const embed = new EmbedBuilder()
        .setColor('Red')
        .setDescription('❌ Erreur lors de la mise à jour du préfixe.');
      return message.reply({ embeds: [embed] });
    }
  },
};
