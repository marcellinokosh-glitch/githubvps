const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "roulette",
    description: "Jeu de roulette russe (fun, sans conséquence).",
    data: new SlashCommandBuilder()
        .setName('roulette')
        .setDescription("Jeu de roulette russe (fun, sans conséquence)"),
    async execute(context) {
        const result = Math.random() < 1/6 ? "💥 Pan ! Tu es éliminé !" : "😅 Tu as survécu !";
        return context.reply({ content: result });
    }
};