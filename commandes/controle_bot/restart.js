const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const OWNER_ID = '1052956303720456313';
const UPTIME_FILE = path.join(__dirname, '..', '..', 'uptime_channel.json');

function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

module.exports = {
  name: "restart",
  description: "Redémarre le bot (owner uniquement)",
  data: new SlashCommandBuilder()
    .setName('restart')
    .setDescription("Redémarre le bot (owner uniquement)"),
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
            .setColor(getEmbedColor())
            .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });

        if (userId !== OWNER_ID) {
            const errorEmbed = new EmbedBuilder()
                .setTitle('⛔ Accès refusé')
                .setDescription("Tu n'as pas la permission d'utiliser cette commande.")
                .setColor(0xED4245)
                .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
            return interaction.reply({ embeds: [errorEmbed], flags: 64 });
        }

        await interaction.reply({ embeds: [embed], flags: 64 });
        // Envoie un log de redémarrage dans le salon uptime
        try {
            const bot = interaction.client;
            const uptimeFile = path.join(__dirname, '..', '..', 'uptime_channel.json');
            if (fs.existsSync(uptimeFile)) {
                const { channelId } = JSON.parse(fs.readFileSync(uptimeFile, 'utf8'));
                if (channelId) {
                    const channel = await bot.channels.fetch(channelId).catch(() => null);
                    if (channel) {
                        const { EmbedBuilder } = require('discord.js');
                        const restartEmbed = new EmbedBuilder()
                            .setTitle('`♻️` Redémarrage')
                            .setDescription(`Le bot va redémarrer...\nRedémarrage demandé le <t:${Math.floor(Date.now()/1000)}:f> par <@${userId}>`)
                            .setColor(getEmbedColor())
                            .setTimestamp()
                            .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
                        await channel.send({ embeds: [restartEmbed] });
                    }
                }
            }
        } catch (e) {
            console.error('[uptime log] Impossible d\'envoyer le log de redémarrage :', e);
        }
        process.exit(0);
    }
};