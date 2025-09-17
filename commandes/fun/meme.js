const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
module.exports = {
    name: "meme",
    description: "Envoie un meme aléatoire.",
    data: new SlashCommandBuilder()
        .setName('meme')
        .setDescription("Envoie un meme aléatoire"),
    async execute(context) {
        try {
            const res = await axios.get('https://meme-api.com/gimme');
            return context.reply({ content: res.data.url });
        } catch {
            return context.reply({ content: "Erreur lors de la récupération du meme." });
        }
    }
};