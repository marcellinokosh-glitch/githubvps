const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
module.exports = {
    name: "clear",
    description: "Supprime un nombre de messages dans le salon.",
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription("Supprime un nombre de messages dans le salon")
        .addIntegerOption(opt => opt.setName('nombre').setDescription('Nombre de messages à supprimer').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(context) {
        const nombre = context.options.getInteger('nombre');
        if (nombre < 1 || nombre > 100) return context.reply({ content: "Entre 1 et 100 messages.", ephemeral: true });
        const messages = await context.channel.bulkDelete(nombre, true);
        return context.reply({ content: `🧹 ${messages.size} messages supprimés !`, ephemeral: true });
    }
};