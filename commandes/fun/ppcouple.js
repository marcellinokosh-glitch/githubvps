const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "ppcouple",
    description: "Affiche les avatars de deux utilisateurs côte à côte.",
    data: new SlashCommandBuilder()
        .setName('ppcouple')
        .setDescription("Affiche les avatars de deux utilisateurs côte à côte")
        .addUserOption(opt => opt.setName('user1').setDescription('Premier utilisateur').setRequired(true))
        .addUserOption(opt => opt.setName('user2').setDescription('Deuxième utilisateur').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const user1 = isSlash ? context.options.getUser('user1') : context.mentions.users.first();
        const user2 = isSlash ? context.options.getUser('user2') : context.mentions.users.last();
        return context.reply({ content: `❤️ [Avatar 1](${user1.displayAvatarURL({ dynamic: true, size: 512 })}) + [Avatar 2](${user2.displayAvatarURL({ dynamic: true, size: 512 })})` });
    }
};