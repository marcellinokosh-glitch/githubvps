const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "say",
    description: "Le bot répète ce que tu écris.",
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription("Le bot répète ce que tu écris")
        .addStringOption(opt => opt.setName('texte').setDescription('Texte à répéter').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const texte = isSlash ? context.options.getString('texte') : args.join(' ');
        return context.reply({ content: texte });
    }
};