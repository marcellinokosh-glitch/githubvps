const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
module.exports = {
    name: "cat",
    description: "Envoie une image de chat aléatoire.",
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription("Envoie une image de chat aléatoire"),
    async execute(context) {
        try {
            const res = await axios.get('https://api.thecatapi.com/v1/images/search');
            return context.reply({ content: res.data[0].url });
        } catch {
            return context.reply({ content: "Erreur lors de la récupération du chat." });
        }
    }
};