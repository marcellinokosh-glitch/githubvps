const { SlashCommandBuilder } = require('discord.js');
module.exports = {
    name: "dice",
    description: "Lance un dé.",
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription("Lance un dé")
        .addIntegerOption(opt => opt.setName('faces').setDescription('Nombre de faces').setRequired(false)),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        let faces = isSlash ? context.options.getInteger('faces') : parseInt(args[0]);
        if (!faces || faces < 2) faces = 6;
        const result = Math.floor(Math.random() * faces) + 1;
        return context.reply({ content: `🎲 Résultat du dé (${faces} faces) : **${result}**` });
    }
};