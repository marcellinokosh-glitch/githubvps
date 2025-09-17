const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "pileouface",
    description: "Lance une pièce virtuelle.",
    data: new SlashCommandBuilder()
        .setName('pileouface')
        .setDescription("Lance une pièce virtuelle"),
    async execute(context) {
        const result = Math.random() < 0.5 ? "Pile" : "Face";
        return context.reply({ content: `🪙 Résultat : **${result}**` });
    }
};