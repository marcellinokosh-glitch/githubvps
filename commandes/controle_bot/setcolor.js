const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');

const colorNames = {
    rouge: "#FF0000",
    red: "#FF0000",
    bleu: "#3498DB",
    blue: "#3498DB",
    vert: "#43B581",
    green: "#43B581",
    jaune: "#FFFF00",
    yellow: "#FFFF00",
    orange: "#FFA500",
    violet: "#9B59B6",
    purple: "#9B59B6",
    rose: "#FF69B4",
    pink: "#FF69B4",
    cyan: "#00FFFF",
    blanc: "#FFFFFF",
    white: "#FFFFFF",
    noir: "#23272A",
    black: "#23272A",
    gris: "#99AAB5",
    gray: "#99AAB5",
};

module.exports = {
    name: "setcolor",
    description: "Change la couleur de tous les embeds du bot (hexadécimal ou nom de couleur)",
    data: new SlashCommandBuilder()
        .setName('setcolor')
        .setDescription("Change la couleur de tous les embeds du bot")
        .addStringOption(option =>
            option.setName('couleur')
                .setDescription('Couleur hexadécimale (ex: #5865F2) ou nom (rouge, bleu, etc)')
                .setRequired(true)
        ),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const userId = isSlash
            ? context.user.id
            : context.author.id;
        let color = isSlash
            ? context.options.getString('couleur')
            : (args[0] || '');

        if (userId !== process.env.OWNER_ID) {
            const reply = "``❌`` Seul le propriétaire du bot peut utiliser cette commande.";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }

        // Vérifie si c'est un nom de couleur
        if (colorNames[color.toLowerCase()]) {
            color = colorNames[color.toLowerCase()];
        }

        // Vérification du format hexadécimal
        if (!/^#?[0-9A-Fa-f]{6}$/.test(color)) {
            const reply = "Merci de fournir une couleur hexadécimale valide (ex: #5865F2) ou un nom de couleur (rouge, bleu, etc).";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }

        // On enlève le # si présent
        const hex = color.startsWith('#') ? color : `#${color}`;
        fs.writeFileSync('./embed_color.txt', hex);

        const reply = `\`\`✅\`\` La couleur des embeds est maintenant : **${hex}**`;
        if (isSlash) {
            return context.reply({ content: reply });
        } else {
            return context.reply(reply);
        }
    }
};