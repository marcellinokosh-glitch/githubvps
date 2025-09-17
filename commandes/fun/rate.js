const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "rate",
    description: "Donne une note aléatoire à un utilisateur.",
    data: new SlashCommandBuilder()
        .setName('rate')
        .setDescription("Donne une note aléatoire à un utilisateur")
        .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur à noter').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const user = isSlash ? context.options.getUser('utilisateur') : context.mentions.users.first();
        const note = Math.floor(Math.random() * 101);
        return context.reply({ content: `Je donne à ${user} la note de **${note}/100** !` });
    }
};