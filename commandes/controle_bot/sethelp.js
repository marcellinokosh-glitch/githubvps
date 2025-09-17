const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: "sethelp",
    description: "Change le mode d’affichage du menu d’aide (global, interactif, menu)",
    data: new SlashCommandBuilder()
        .setName('sethelp')
        .setDescription("Change le mode d’affichage du menu d’aide")
        .addStringOption(option =>
            option.setName('mode')
                .setDescription('Mode d’aide (global, interactif, menu)')
                .setRequired(true)
                .addChoices(
                    { name: 'global', value: 'global' },
                    { name: 'interactif', value: 'interactif' },
                    { name: 'menu', value: 'menu' }
                )
        ),
    async execute(interactionOrMessage, args) {
        const isSlash = !!interactionOrMessage.isChatInputCommand;
        const mode = isSlash
            ? interactionOrMessage.options.getString('mode')
            : (args[0] || '').toLowerCase();

        if (!['global', 'interactif', 'menu'].includes(mode)) {
            const reply = "❌ Mode invalide. Choisis entre `global`, `interactif` ou `menu`.";
            if (isSlash) {
                return interactionOrMessage.reply({ content: reply, flags: 64 });
            } else {
                return interactionOrMessage.reply(reply);
            }
        }

        fs.writeFileSync('./help_mode.txt', mode);

        const reply = `✅ Le mode d’aide a été changé pour **${mode}**.`;
        if (isSlash) {
            return interactionOrMessage.reply({ content: reply });
        } else {
            return interactionOrMessage.reply(reply);
        }
    }
};