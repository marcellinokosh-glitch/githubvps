const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
module.exports = {
    name: "dog",
    description: "Envoie une image de chien aléatoire.",
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription("Envoie une image de chien aléatoire"),
    async execute(context) {
        try {
            const res = await axios.get('https://dog.ceo/api/breeds/image/random');
            return context.reply({ content: res.data.message });
        } catch {
            return context.reply({ content: "Erreur lors de la récupération du chien." });
        }
    }
};