const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const statutFile = path.join(__dirname, '..', '..', 'statut.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('statut')
        .setDescription('Change le statut du bot')
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type de statut')
                .setRequired(true)
                .addChoices(
                    { name: 'En ligne', value: 'online' },
                    { name: 'Inactif', value: 'idle' },
                    { name: 'Ne pas déranger', value: 'dnd' },
                    { name: 'Streaming', value: 'streaming' }
                )
        )
        .addStringOption(option =>
            option.setName('texte')
                .setDescription('Texte à afficher dans le statut')
                .setRequired(false)
        ),
    async execute(interaction) {
        // Récupère les arguments pour slash ou préfixe
        let type, texte;
        if (interaction.options?.getString) {
            type = interaction.options.getString('type') || interaction.options.getString();
            texte = interaction.options.getString('texte') || null;
        } else {
            // Pour le préfixe : !statut type texte
            const args = interaction.content?.split(' ').slice(1) || [];
            type = args[0];
            texte = args.slice(1).join(' ') || null;
        }

        let embed;
        if (type === 'streaming') {
            const activity = texte || 'en live !';
            const url = 'https://twitch.tv/vicieuu';
            await interaction.client.user.setActivity(activity, {
                type: 'STREAMING',
                url: url
            });
            await interaction.client.user.setStatus('online');
            fs.writeFileSync(statutFile, JSON.stringify({ type: 'streaming', activity, url }, null, 2));
            embed = new EmbedBuilder()
                .setTitle('🎥 Statut')
                .setDescription(`Statut changé en streaming${texte ? ` : ${texte}` : ' !'}`)
                .setColor(0x5865F2);
        } else {
            await interaction.client.user.setActivity(texte || null);
            await interaction.client.user.setStatus(type);
            fs.writeFileSync(statutFile, JSON.stringify({ type, activity: texte || null }, null, 2));
            embed = new EmbedBuilder()
                .setTitle('🟢 Statut')
                .setDescription(`Statut changé en ${type}${texte ? ` : ${texte}` : ' !'}`)
                .setColor(0x5865F2);
        }

        if (typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand()) {
            await interaction.reply({ embeds: [embed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [embed] });
        }
    }
};