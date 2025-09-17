const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
module.exports = {
    name: "banner",
    description: "Affiche la bannière d'un utilisateur (si disponible).",
    data: new SlashCommandBuilder()
        .setName('banner')
        .setDescription("Affiche la bannière d'un utilisateur")
        .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur').setRequired(false)),
    async execute(context) {
        const user = context.options?.getUser('utilisateur') || context.user;
        const fetchedUser = await context.client.users.fetch(user.id, { force: true });
        if (!fetchedUser.banner) return context.reply({ content: "Cet utilisateur n'a pas de bannière." });
        const embed = new EmbedBuilder()
            .setTitle(`Bannière de ${user.tag}`)
            .setImage(fetchedUser.bannerURL({ dynamic: true, size: 1024 }))
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    }
};