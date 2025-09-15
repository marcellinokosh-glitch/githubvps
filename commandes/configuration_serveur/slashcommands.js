const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ServerConfig = require('../configuration_serveur/serverConfig');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slashcommands')
        .setDescription('Active ou désactive les commandes slash sur ce serveur')
        .addBooleanOption(option =>
            option.setName('enable')
                .setDescription('true = activer, false = désactiver')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {
        const enable = interaction.options.getBoolean('enable');
        await ServerConfig.findOneAndUpdate(
            { guildId: interaction.guildId },
            { $set: { slashEnabled: enable } },
            { upsert: true }
        );
        await interaction.reply({ content: `Commandes slash ${enable ? 'activées' : 'désactivées'} sur ce serveur.`, flags: 64 });
    }
};
