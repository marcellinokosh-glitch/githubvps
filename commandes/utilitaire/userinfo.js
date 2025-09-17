const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    name: "userinfo",
    description: "Affiche les infos d'un utilisateur.",
    data: new SlashCommandBuilder()
        .setName('userinfo')
        .setDescription("Affiche les infos d'un utilisateur")
        .addUserOption(opt => opt.setName('utilisateur').setDescription('Utilisateur').setRequired(false)),
    async execute(context) {
        const user = context.options?.getUser('utilisateur') || context.user;
        const member = context.guild?.members.cache.get(user.id);
        const embed = new EmbedBuilder()
            .setTitle(`Infos de ${user.tag}`)
            .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 512 }))
            .addFields(
                { name: "ID", value: user.id, inline: true },
                { name: "Créé le", value: `<t:${Math.floor(user.createdTimestamp/1000)}:f>`, inline: true },
                member ? { name: "Arrivé sur le serveur", value: `<t:${Math.floor(member.joinedTimestamp/1000)}:f>`, inline: true } : { name: "\u200B", value: "\u200B", inline: true }
            )
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    }
};