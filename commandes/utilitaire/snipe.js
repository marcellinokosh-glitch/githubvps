const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let lastDeleted = {};

module.exports = {
    name: "snipe",
    description: "Affiche le dernier message supprimé du salon.",
    data: new SlashCommandBuilder()
        .setName('snipe')
        .setDescription("Affiche le dernier message supprimé du salon"),
    async execute(context) {
        const sniped = lastDeleted[context.channel.id];
        if (!sniped) return context.reply({ content: "Aucun message à snip !" });
        const embed = new EmbedBuilder()
            .setAuthor({ name: sniped.author })
            .setDescription(sniped.content)
            .setFooter({ text: `Supprimé à ${sniped.time}` })
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    },
    // À placer dans ton bot.js :
    // client.on('messageDelete', msg => {
    //   if (msg.partial || !msg.content) return;
    //   lastDeleted[msg.channel.id] = {
    //     content: msg.content,
    //     author: msg.author.tag,
    //     time: new Date().toLocaleTimeString()
    //   };
    // });
};