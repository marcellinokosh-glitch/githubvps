const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "avatar",
    description: "Affiche l'avatar d'un utilisateur.",
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription("Affiche l'avatar d'un utilisateur")
        .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur').setRequired(false)),
    async execute(context) {
        const user = context.options?.getUser('utilisateur') || context.user;
        return context.reply({ content: user.displayAvatarURL({ dynamic: true, size: 512 }) });
    }
};