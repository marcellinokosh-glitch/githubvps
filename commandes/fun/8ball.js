const { SlashCommandBuilder } = require('discord.js');
const responses = [
    "Oui.", "Non.", "Peut-être.", "Certainement !", "Jamais.", "Demande plus tard.", "Je ne sais pas.", "Probablement.", "C'est sûr !", "J'en doute."
];

module.exports = {
    name: "8ball",
    description: "Pose une question à la boule magique.",
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription("Pose une question à la boule magique")
        .addStringOption(opt => opt.setName('question').setDescription('Ta question').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const question = isSlash ? context.options.getString('question') : args.join(' ');
        const answer = responses[Math.floor(Math.random() * responses.length)];
        return context.reply({ content: `🎱 **Question :** ${question}\n**Réponse :** ${answer}` });
    }
};