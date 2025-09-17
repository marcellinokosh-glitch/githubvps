const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "ship",
    description: "Calcule la compatibilité entre deux utilisateurs.",
    data: new SlashCommandBuilder()
        .setName('ship')
        .setDescription("Calcule la compatibilité entre deux utilisateurs")
        .addUserOption(opt => opt.setName('user1').setDescription('Premier utilisateur').setRequired(true))
        .addUserOption(opt => opt.setName('user2').setDescription('Deuxième utilisateur').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const user1 = isSlash ? context.options.getUser('user1') : context.mentions.users.first();
        const user2 = isSlash ? context.options.getUser('user2') : context.mentions.users.last();
        const percent = Math.floor(Math.random() * 101);
        return context.reply({ content: `💞 Compatibilité entre ${user1} et ${user2} : **${percent}%** !` });
    }
};