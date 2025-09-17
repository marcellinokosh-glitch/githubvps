const { SlashCommandBuilder } = require('discord.js');
const blagues = [
    "Pourquoi les canards ont-ils autant de plumes ? Pour couvrir leur derrière.",
    "Quel est le comble pour un électricien ? De ne pas être au courant.",
    "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
    "Que dit une imprimante dans l’eau ? J’ai papier.",
    "Pourquoi les poissons détestent l’ordinateur ? À cause d’Internet.",
    "Pourquoi les squelettes ne se battent-ils jamais entre eux ? Ils n'ont pas le cran.",
    "Pourquoi les vampires n’aiment-ils pas l’ail ? Parce que ça les fait suer.",
    "Pourquoi les maths sont tristes ? Parce qu’elles ont trop de problèmes.",
    "Pourquoi les poules n’ont-elles pas de seins ? Parce que les coqs n’ont pas de mains.",
    "Pourquoi les Belges vont-ils à l’hôpital avec une échelle ? Pour voir l’ORL.",
    "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
    "Pourquoi les girafes ont-elles un long cou ? Parce que leurs pieds sentent mauvais.",
    "Pourquoi les oiseaux ne tweetent-ils jamais la nuit ? Parce qu’ils dorment.",
    "Pourquoi les chats n’aiment-ils pas l’eau ? Parce que dans l’eau minet ralenti.",
    "Pourquoi les vaches ferment-elles les yeux quand elles mangent de l’herbe ? Pour mieux voir pousser l’herbe.",
    "Pourquoi les éléphants n’utilisent-ils pas d’ordinateur ? Parce qu’ils ont peur de la souris.",
    "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
    "Pourquoi les abeilles vont-elles à l’école ? Pour apprendre à bzzz-travailler.",
    "Pourquoi les poissons détestent l’ordinateur ? Parce qu’ils ont peur du net.",
    "Pourquoi les bananes mettent-elles de la crème solaire ? Pour ne pas mûrir trop vite.",
    "Pourquoi les cochons roses ? Parce qu’ils mangent des carottes.",
    "Pourquoi les poules traversent-elles la route ? Pour aller de l’autre côté.",
    "Pourquoi les fantômes aiment-ils les ascenseurs ? Parce qu’ils élèvent les esprits.",
    "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
    "Pourquoi les vampires n’aiment-ils pas les maths ? Parce qu’ils détestent les racines carrées.",
    "Pourquoi les ordinateurs n’aiment-ils pas l’eau ? Parce qu’ils plantent.",
    "Pourquoi les plongeurs plongent-ils toujours en arrière et jamais en avant ? Parce que sinon ils tombent dans le bateau.",
];

module.exports = {
    name: "blague",
    description: "Raconte une blague aléatoire.",
    data: new SlashCommandBuilder()
        .setName('blague')
        .setDescription("Raconte une blague aléatoire"),
    async execute(context) {
        const joke = blagues[Math.floor(Math.random() * blagues.length)];
        return context.reply({ content: `😂 ${joke}` });
    }
};