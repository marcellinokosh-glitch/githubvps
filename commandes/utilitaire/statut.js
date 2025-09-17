const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: "statut",
    description: "Change le statut et l'activité du bot (dev uniquement)",
    data: new SlashCommandBuilder()
        .setName('statut')
        .setDescription("Change le statut et l'activité du bot")
        .addStringOption(opt =>
            opt.setName('type')
                .setDescription('Type d\'activité')
                .setRequired(false)
                .addChoices(
                    { name: 'Joue à', value: 'PLAYING' },
                    { name: 'Regarde', value: 'WATCHING' },
                    { name: 'Écoute', value: 'LISTENING' },
                    { name: 'Compétition', value: 'COMPETING' },
                    { name: 'Stream', value: 'STREAMING' }
                )
        )
        .addStringOption(opt =>
            opt.setName('texte')
                .setDescription('Texte de l\'activité')
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('url')
                .setDescription('URL du stream (obligatoire pour STREAMING)')
                .setRequired(false)
        )
        .addStringOption(opt =>
            opt.setName('statut')
                .setDescription('Statut du bot')
                .setRequired(false)
                .addChoices(
                    { name: 'En ligne', value: 'online' },
                    { name: 'Absent', value: 'idle' },
                    { name: 'Ne pas déranger', value: 'dnd' },
                    { name: 'Invisible', value: 'invisible' }
                )
        ),
    async execute(context, args) {
        const { hasGrade } = require('../../utils/grades');
        const userId = context.user?.id || context.author?.id;
        if (!hasGrade(userId, 'dev')) {
            return context.reply({ content: "❌ Seuls les développeurs du bot peuvent changer le statut.", flags: 64 });
        }

        const isSlash = !!context.isChatInputCommand;
        let type, texte, statut, url;
        if (isSlash) {
            type = context.options.getString('type');
            texte = context.options.getString('texte');
            statut = context.options.getString('statut');
            url = context.options.getString('url');
        } else {
            type = args[0];
            texte = args[1];
            url = args[2];
            statut = args[3];
        }

        try {
            if (type && texte) {
                if (type === 'STREAMING') {
                    if (!url) {
                        return context.reply({ content: "❌ Merci de fournir une URL Twitch valide pour le mode STREAMING.", flags: 64 });
                    }
                    await context.client.user.setActivity(texte, { type: 'STREAMING', url });
                } else {
                    await context.client.user.setActivity(texte, { type });
                }
            }
            if (statut) {
                await context.client.user.setStatus(statut);
            }
            return context.reply({ content: "✅ Statut du bot mis à jour !" });
        } catch (err) {
            console.error("Erreur statut :", err);
            return context.reply({ content: "❌ Erreur lors du changement de statut." });
        }
    }
};