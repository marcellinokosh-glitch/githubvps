const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Affiche la liste des commandes par catégorie'),
    async execute(interaction) {
        const commandesPath = path.join(__dirname, '..', '..', 'commandes');
        const categories = fs.readdirSync(commandesPath).filter(f => fs.statSync(path.join(commandesPath, f)).isDirectory());

        let description = '';

        for (const categorie of categories) {
            const files = fs.readdirSync(path.join(commandesPath, categorie)).filter(f => f.endsWith('.js'));
            const commandNames = files.map(f => {
                const cmd = require(path.join(commandesPath, categorie, f));
                // Affiche slash ET commandes prefixées (name ou data.name)
                let name = null;
                if (cmd && cmd.data && cmd.data.name) {
                    name = `/${cmd.data.name}`;
                } else if (cmd && cmd.name) {
                    name = `!${cmd.name}`;
                }
                if (name) {
                    // Masque les underscores dans les noms de commandes
                    return `\`${name.replace(/_/g, ' ')}\``;
                }
                return null;
            }).filter(Boolean);
            if (commandNames.length > 0) {
                // Masque les underscores dans les noms de catégories
                description += `**${categorie.replace(/_/g, ' ')}**\n${commandNames.join(' ')}\n\n`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('Aide du bot')
            .setDescription(description || "Aucune commande trouvée.")
            .setColor(0x5865F2);

        if (typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            await interaction.reply({ embeds: [embed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};