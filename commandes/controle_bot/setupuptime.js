const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const UPTIME_FILE = path.join(__dirname, '..', '..', 'uptime_channel.json');
const OWNER_ID = '1052956303720456313';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setupuptime')
        .setDescription('Crée un salon uptime pour les annonces du bot')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .setDMPermission(false),
    async execute(interaction) {
        const userId = interaction.user?.id || interaction.author?.id;
        const isSlash = typeof interaction.reply === 'function' && interaction.isChatInputCommand && interaction.isChatInputCommand();

        if (userId !== OWNER_ID) {
            const embed = new EmbedBuilder()
                .setTitle('⛔ Accès refusé')
                .setDescription("Tu n'as pas la permission d'utiliser cette commande.")
                .setColor(0xED4245);
            if (isSlash) {
                return interaction.reply({ embeds: [embed], flags: 64 });
            } else {
                return interaction.reply({ embeds: [embed] });
            }
        }

        // Cherche un salon nommé "uptime"
        let channel = interaction.guild.channels.cache.find(ch => ch.name === 'uptime' && ch.type === 0);
        if (!channel) {
            channel = await interaction.guild.channels.create({
                name: 'uptime',
                type: 0, // 0 = GUILD_TEXT
                reason: 'Salon uptime pour les annonces du bot'
            });
        }

        // Sauvegarde l'ID du salon dans un fichier
        fs.writeFileSync(UPTIME_FILE, JSON.stringify({ channelId: channel.id }, null, 2));

        // Embed principal comme au lancement du bot
        const mainEmbed = new EmbedBuilder()
            .setTitle('✅ Redémarrage terminé')
            .setDescription('Le bot a bien redémarré et est opérationnel !')
            .setColor(0x57F287)
            .setTimestamp();

        // Envoie l'embed dans le salon uptime
        await channel.send({ embeds: [mainEmbed] });

        // Réponse à l'utilisateur
        const confirmEmbed = new EmbedBuilder()
            .setTitle('✅ Salon uptime configuré')
            .setDescription(`Salon <#${channel.id}> configuré pour l'uptime !`)
            .setColor(0x57F287);
        if (isSlash) {
            await interaction.reply({ embeds: [confirmEmbed], flags: 64 });
        } else {
            await interaction.reply({ embeds: [confirmEmbed] });
        }
    },
    help: false // Pour ne pas l'afficher dans le help
};