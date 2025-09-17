const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
    name: "setbanner",
    description: "Change la bannière du bot (owner uniquement, URL ou fichier image)",
    data: new SlashCommandBuilder()
        .setName('setbanner')
        .setDescription("Change la bannière du bot")
        .addStringOption(option =>
            option.setName('url')
                .setDescription('URL de la nouvelle bannière')
                .setRequired(false)
        )
        .addAttachmentOption(option =>
            option.setName('fichier')
                .setDescription('Fichier image à utiliser comme bannière')
                .setRequired(false)
        ),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const userId = isSlash
            ? context.user.id
            : context.author.id;

        if (userId !== process.env.OWNER_ID) {
            const reply = "❌ Seul le propriétaire du bot peut utiliser cette commande.";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }

        let imageBuffer = null;

        // Gestion slash
        if (isSlash) {
            const url = context.options.getString('url');
            const fichier = context.options.getAttachment('fichier');
            if (fichier) {
                // Fichier uploadé
                const response = await axios.get(fichier.url, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data, 'binary');
            } else if (url) {
                // URL directe
                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    imageBuffer = Buffer.from(response.data, 'binary');
                } catch {
                    return context.reply({ content: "❌ Impossible de télécharger l'image depuis l'URL.", flags: 64 });
                }
            } else {
                return context.reply({ content: "Merci de fournir une image via un fichier ou une URL.", flags: 64 });
            }
        } else {
            // Commande texte
            const url = args[0];
            if (context.attachments && context.attachments.size > 0) {
                // Fichier uploadé
                const attachment = context.attachments.first();
                const response = await axios.get(attachment.url, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data, 'binary');
            } else if (url && /^https?:\/\//.test(url)) {
                try {
                    const response = await axios.get(url, { responseType: 'arraybuffer' });
                    imageBuffer = Buffer.from(response.data, 'binary');
                } catch {
                    return context.reply("❌ Impossible de télécharger l'image depuis l'URL.");
                }
            } else {
                return context.reply("Merci de fournir une image via un fichier ou une URL.");
            }
        }

        try {
            await context.client.user.setBanner(imageBuffer);
            const reply = "✅ La bannière du bot a été changée avec succès.";
            if (isSlash) {
                return context.reply({ content: reply });
            } else {
                return context.reply(reply);
            }
        } catch (err) {
            const reply = "❌ Impossible de changer la bannière du bot (erreur Discord ou format non supporté).";
            if (isSlash) {
                return context.reply({ content: reply, flags: 64 });
            } else {
                return context.reply(reply);
            }
        }
    }
};