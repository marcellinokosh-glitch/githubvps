const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "reverse",
    description: "Renvoie le texte à l'envers.",
    data: new SlashCommandBuilder()
        .setName('reverse')
        .setDescription("Renvoie le texte à l'envers")
        .addStringOption(opt => opt.setName('texte').setDescription('Texte à inverser').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const texte = isSlash ? context.options.getString('texte') : args.join(' ');
        return context.reply({ content: texte.split('').reverse().join('') });
    }
};