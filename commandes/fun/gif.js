const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const GIPHY_API_KEY = '6QbaklGwkFFlffT5RvzsffemZyoUs7O2'; // Remplace par ta clé API Giphy

module.exports = {
    name: "gif",
    description: "Envoie un GIF aléatoire selon un mot-clé.",
    data: new SlashCommandBuilder()
        .setName('gif')
        .setDescription("Envoie un GIF aléatoire selon un mot-clé")
        .addStringOption(opt => opt.setName('mot').setDescription('Mot-clé').setRequired(true)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const mot = isSlash ? context.options.getString('mot') : args.join(' ');
        try {
            const res = await axios.get(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(mot)}&limit=50`);
            const gifs = res.data.data;
            if (!gifs.length) return context.reply({ content: "Aucun GIF trouvé !" });
            const gif = gifs[Math.floor(Math.random() * gifs.length)].images.original.url;
            return context.reply({ content: gif });
        } catch {
            return context.reply({ content: "Erreur lors de la récupération du GIF." });
        }
    }
};