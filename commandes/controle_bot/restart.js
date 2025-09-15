const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = '1052956303720456313';
const UPTIME_FILE = path.join(__dirname, '..', '..', 'uptime_channel.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('restart')
        .setDescription('Redémarre le bot (réservé au propriétaire)'),
    async execute(interaction) {
        // Compatibilité préfixe et slash
        const userId = interaction.user?.id || interaction.author?.id;
        const isSlash = typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand();

        // Récupère l'ID du salon uptime
        let uptimeChannelMention = '#uptime';
        if (fs.existsSync(UPTIME_FILE)) {
            const data = JSON.parse(fs.readFileSync(UPTIME_FILE, 'utf8'));
            if (data.channelId) {
                uptimeChannelMention = `<#${data.channelId}>`;
            }
        }

        const embed = new EmbedBuilder()
            .setTitle('♻️ Redémarrage')
            .setDescription(`Le bot redémarre...\n\nPour vérifier si le bot est bien relancé, consulte ${uptimeChannelMention}.`)
            .setColor(0x5865F2);

        if (userId !== OWNER_ID) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('⛔ Accès refusé')
                .setDescription("Tu n'as pas la permission d'utiliser cette commande.")
                .setColor(0xED4245);
            if (isSlash) {
                return interaction.reply({ embeds: [errorEmbed], flags: 64 });
            } else {
                return interaction.reply({ embeds: [errorEmbed] });
            }
        }

        if (isSlash) {
            await interaction.reply({ embeds: [embed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
        process.exit(0);
    }
};