const { SlashCommandBuilder } = require('discord.js');
const mots = ["chat", "chien", "maison", "voiture", "ordinateur", "discord", "musique", "soleil"];
module.exports = {
    name: "motus",
    description: "Devine un mot aléatoire (motus simplifié).",
    data: new SlashCommandBuilder()
        .setName('motus')
        .setDescription("Devine un mot aléatoire (motus simplifié)"),
    async execute(context) {
        const mot = mots[Math.floor(Math.random() * mots.length)];
        return context.reply({ content: `Le mot à deviner commence par **${mot[0]}** et fait ${mot.length} lettres ! (Réponds ici pour jouer)` });
    }
};