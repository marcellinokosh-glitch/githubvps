
const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, PermissionsBitField } = require('discord.js');
const GuildConfig = require('../configuration_serveur/guildConfig');

module.exports = {
  name: 'setprefix',
  description: 'Définit ou affiche le préfixe du bot pour ce serveur',
  category: 'controle_bot',
  data: new SlashCommandBuilder()
    .setName('setprefix')
    .setDescription('Définit ou affiche le préfixe du bot pour ce serveur')
    .addStringOption(option =>
      option.setName('prefix')
        .setDescription('Nouveau préfixe (laisser vide pour afficher le préfixe actuel)')
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDMPermission(false),
  async execute(interactionOrMessage, args) {
    // Compatibilité slash et text
    const isSlash = typeof interactionOrMessage.reply === 'function' && interactionOrMessage.isChatInputCommand && interactionOrMessage.isChatInputCommand();
    const member = isSlash ? interactionOrMessage.member : interactionOrMessage.member;
    const guild = isSlash ? interactionOrMessage.guild : interactionOrMessage.guild;
    const userId = isSlash ? interactionOrMessage.user?.id : interactionOrMessage.author?.id;
    let newPrefix = isSlash
      ? interactionOrMessage.options.getString('prefix')
      : args[0];
    // Permission admin requise
    if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      const embed = new EmbedBuilder()
  .setColor('Red')
  .setDescription('❌ Vous devez être administrateur pour changer le préfixe.')
  .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
  return interactionOrMessage.reply({ embeds: [embed], ...(isSlash ? { flags: 64 } : {}) });
    }

    // Afficher le préfixe actuel si aucun argument
    if (!newPrefix) {
      let prefix = '!';
      try {
        const config = await GuildConfig.findOne({ guildId: guild.id });
        if (config && config.prefix) prefix = config.prefix;
      } catch {}
      const embed = new EmbedBuilder()
  .setColor('Blue')
  .setDescription(`🔎 Le préfixe actuel est : \`${prefix}\``)
  .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
  return interactionOrMessage.reply({ embeds: [embed], ...(isSlash ? { flags: 64 } : {}) });
    }

    // Validation avancée
    if (newPrefix.length > 5 || /[\s@#<>`]/.test(newPrefix)) {
      const embed = new EmbedBuilder()
  .setColor('Orange')
  .setDescription('⚠️ Préfixe invalide. 1-5 caractères, pas d’espace ni de caractères spéciaux (@, #, <, >, `).')
  .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
  return interactionOrMessage.reply({ embeds: [embed], ...(isSlash ? { flags: 64 } : {}) });
    }

    try {
      const oldConfig = await GuildConfig.findOne({ guildId: guild.id });
      const oldPrefix = oldConfig && oldConfig.prefix ? oldConfig.prefix : '!';
      await GuildConfig.findOneAndUpdate(
        { guildId: guild.id },
        { prefix: newPrefix },
        { upsert: true, new: true }
      );
      const embed = new EmbedBuilder()
  .setColor('Green')
  .setTitle('Préfixe modifié')
  .setDescription(`Ancien préfixe : \`${oldPrefix}\`\nNouveau préfixe : \`${newPrefix}\``)
  .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
  return interactionOrMessage.reply({ embeds: [embed], ...(isSlash ? { flags: 64 } : {}) });
    } catch (err) {
      const embed = new EmbedBuilder()
  .setColor('Red')
  .setDescription('❌ Erreur lors de la mise à jour du préfixe.')
  .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
      return interactionOrMessage.reply({ embeds: [embed], ephemeral: isSlash });
    }
  },
};
