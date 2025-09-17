const { SlashCommandBuilder } = require('discord.js');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

module.exports = {
  name: "setpic",
  description: "Change la photo de profil du bot (owner uniquement)",
  data: new SlashCommandBuilder()
    .setName('setpic')
    .setDescription("Change la photo de profil du bot (owner uniquement)")
    .addStringOption(option =>
      option.setName('url')
        .setDescription("URL de l'image ou nom de fichier local (.png/.jpg)")
        .setRequired(false)
    ),
  async execute(interactionOrMessage, args) {
    const isSlash = !!interactionOrMessage.isChatInputCommand;
    const userId = isSlash
      ? interactionOrMessage.user.id
      : interactionOrMessage.author.id;
    const input = isSlash
      ? interactionOrMessage.options.getString('url')
      : args[0];

    if (userId !== process.env.OWNER_ID) {
      const reply = "``❌`` Seul le propriétaire du bot peut utiliser cette commande.";
      if (isSlash) {
        return interactionOrMessage.reply({ content: reply, flags: 64 });
      } else {
        return interactionOrMessage.reply(reply);
      }
    }

    let avatarData = null;

    // 1. Si argument fourni (URL ou fichier local)
    if (input) {
      if (/^https?:\/\//.test(input)) {
        // URL d'image
        const res = await fetch(input, { method: 'GET' });
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
          const reply = "``❌`` L'URL fournie n'est pas une image valide.";
          if (isSlash) {
            return interactionOrMessage.reply({ content: reply, flags: 64 });
          } else {
            return interactionOrMessage.reply(reply);
          }
        }
        avatarData = Buffer.from(await res.arrayBuffer());
      } else {
        // Fichier local
        const filePath = path.resolve(process.cwd(), input);
        if (!fs.existsSync(filePath)) {
          const reply = "``❌`` Le fichier local spécifié est introuvable.";
          if (isSlash) {
            return interactionOrMessage.reply({ content: reply, flags: 64 });
          } else {
            return interactionOrMessage.reply(reply);
          }
        }
        avatarData = fs.readFileSync(filePath);
      }
    }

    // 2. Si pas d'argument, on regarde les pièces jointes (textuel uniquement)
    if (!avatarData && !isSlash && interactionOrMessage.attachments && interactionOrMessage.attachments.size > 0) {
      const attachment = interactionOrMessage.attachments.find(att => att.contentType && att.contentType.startsWith('image/'));
      if (attachment) {
        avatarData = await fetch(attachment.url).then(res => res.buffer());
      }
    }

    if (!avatarData) {
      const reply = "Merci de fournir une URL d'image, un nom de fichier ou une image en pièce jointe.";
      if (isSlash) {
        return interactionOrMessage.reply({ content: reply, flags: 64 });
      } else {
        return interactionOrMessage.reply(reply);
      }
    }

    try {
      await interactionOrMessage.client.user.setAvatar(avatarData);
      const reply = "``✅`` Photo de profil changée !";
      if (isSlash) {
        return interactionOrMessage.reply({ content: reply });
      } else {
        return interactionOrMessage.reply(reply);
      }
    } catch (e) {
      const reply = "``❌`` Erreur lors du changement de photo de profil.";
      if (isSlash) {
        return interactionOrMessage.reply({ content: reply, flags: 64 });
      } else {
        return interactionOrMessage.reply(reply);
      }
    }
  }
};