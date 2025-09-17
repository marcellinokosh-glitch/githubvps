const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    name: "setname",
    description: "Change le nom du bot (owner uniquement)",
    data: new SlashCommandBuilder()
        .setName('setname')
        .setDescription("Change le nom du bot")
        .addStringOption(option =>
            option.setName('nom')
                .setDescription('Nouveau nom du bot')
                .setRequired(true)
        ),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const userId = isSlash
            ? context.user.id
            : context.author.id;
        const newName = isSlash
            ? context.options.getString('nom')
            : (args[0] || '');

        // Vérifie si l'utilisateur est owner
        if (userId !== process.env.OWNER_ID) {
            const reply = "❌ Seul le propriétaire du bot peut utiliser cette commande.";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }

        if (!newName || newName.length < 2 || newName.length > 32) {
            const reply = "Le nom doit faire entre 2 et 32 caractères.";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }

        try {
            await context.client.user.setUsername(newName);
            const reply = `✅ Le nom du bot a été changé en **${newName}**.`;
            if (isSlash) {
                return context.reply({ content: reply });
            } else {
                return context.reply(reply);
            }
        } catch (err) {
            const reply = "❌ Impossible de changer le nom du bot (limite Discord ou erreur).";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }
    }
}; 