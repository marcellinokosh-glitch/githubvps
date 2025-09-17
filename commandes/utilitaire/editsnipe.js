const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
let lastEdit = {};

module.exports = {
    name: "editsnipe",
    description: "Affiche le dernier message édité du salon.",
    data: new SlashCommandBuilder()
        .setName('editsnipe')
        .setDescription("Affiche le dernier message édité du salon"),
    async execute(context) {
        const sniped = lastEdit[context.channel.id];
        if (!sniped) return context.reply({ content: "Aucun message édité à snip !" });
        const embed = new EmbedBuilder()
            .setAuthor({ name: sniped.author })
            .addFields(
                { name: "Avant", value: sniped.old, inline: false },
                { name: "Après", value: sniped.new, inline: false }
            )
            .setFooter({ text: `Édité à ${sniped.time}` })
            .setColor("#5865F2");
        return context.reply({ embeds: [embed] });
    },
    // À placer dans ton bot.js :
    // client.on('messageUpdate', (oldMsg, newMsg) => {
    //   if (oldMsg.partial || newMsg.partial || !oldMsg.content || !newMsg.content) return;
    //   lastEdit[oldMsg.channel.id] = {
    //     old: oldMsg.content,
    //     new: newMsg.content,
    //     author: oldMsg.author.tag,
    //     time: new Date().toLocaleTimeString()
    //   };
    // });
};