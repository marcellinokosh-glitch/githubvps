const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, StringSelectMenuBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fonction utilitaire pour la couleur dynamique
function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

module.exports = {
    name: "help",
    description: "Affiche la liste des commandes du bot",
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription("Affiche la liste des commandes du bot"),
    async execute(context) {
        let mode = 'global';
        try {
            mode = fs.readFileSync('./help_mode.txt', 'utf8').trim();
        } catch (e) {}

        if (mode === 'interactif') {
            return showHelpWithButtons(context);
        } else if (mode === 'menu') {
            return showHelpWithSelectMenu(context);
        } else {
            return showGlobalHelp(context);
        }
    }
};

const ordreCategories = [
    "utilitaire",
    "musique",
    "fun",
    "moderations",
    "antiraid",
    "logs",
    "configuration_serveur",
    "gestion_serveur",
    "controle_bot"
];

// Ajoute un mapping emoji pour chaque catégorie
const categoryEmojis = {
    utilitaire: "🛠️",
    musique: "🎵",
    fun: "🎲",
    moderations: "🛡️",
    antiraid: "🚨",
    logs: "📜",
    configuration_serveur: "⚙️",
    gestion_serveur: "🗂️",
    controle_bot: "🤖"
};

async function showGlobalHelp(context) {
    const commandesPath = path.join(__dirname, '..', '..', 'commandes');
    const categories = ordreCategories.filter(cat => fs.existsSync(path.join(commandesPath, cat)));

    let description = '';
    for (const categorie of categories) {
        const files = fs.readdirSync(path.join(commandesPath, categorie)).filter(f => f.endsWith('.js'));
        const commandNames = files.map(f => {
            const cmd = require(path.join(commandesPath, categorie, f));
            let name = null;
            if (cmd && cmd.data && cmd.data.name) name = `/${cmd.data.name}`;
            else if (cmd && cmd.name) name = `!${cmd.name}`;
            if (name && name !== '!model') return `\`${name.replace(/_/g, ' ')}\``;
            return null;
        }).filter(Boolean);
        if (commandNames.length > 0) {
            // Ajoute l'emoji devant le nom de la catégorie
            const emoji = categoryEmojis[categorie] || '';
            description += `**${emoji} ${categorie.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}**\n${commandNames.join(' ')}\n\n`;
        }
    }
    const embed = new EmbedBuilder()
        .setTitle('`❓` Aide du bot')
        .setDescription(description || "Aucune commande trouvée.")
        .setColor(getEmbedColor())
        .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
    await context.reply({ embeds: [embed] });
}

async function showHelpWithButtons(context) {
    const commandesPath = path.join(__dirname, '..', '..', 'commandes');
    const categories = ordreCategories.filter(cat => fs.existsSync(path.join(commandesPath, cat)));
    let index = 0;

    const getEmbed = (catIdx) => {
        const categorie = categories[catIdx];
        const files = fs.readdirSync(path.join(commandesPath, categorie)).filter(f => f.endsWith('.js'));
        const commandInfos = files.map(f => {
            const cmd = require(path.join(commandesPath, categorie, f));
            let name = null;
            if (cmd && cmd.data && cmd.data.name) name = `/${cmd.data.name}`;
            else if (cmd && cmd.name) name = `!${cmd.name}`;
            if (name && name !== '!model') {
                const desc = cmd.description ? `\n> ${cmd.description}` : '';
                return `\`${name.replace(/_/g, ' ')}\`${desc}`;
            }
            return null;
        }).filter(Boolean);
        return new EmbedBuilder()
            .setTitle(`\`❓\` Aide - ${categorie.replace(/_/g, ' ')}`)
            .setDescription(commandInfos.join('\n\n') || "Aucune commande trouvée.")
            .setColor(getEmbedColor())
            .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
    };

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
    );

    const message = await context.reply({ embeds: [getEmbed(index)], components: [row] });

    const collector = message.createMessageComponentCollector({ time: 60000 });
    collector.on('collect', async i => {
        if (i.customId === 'prev') index = (index - 1 + categories.length) % categories.length;
        if (i.customId === 'next') index = (index + 1) % categories.length;
        await i.update({ embeds: [getEmbed(index)], components: [row] });
    });
    collector.on('end', async () => {
        try { await message.edit({ components: [] }); } catch {}
    });
}

async function showHelpWithSelectMenu(context) {
    const commandesPath = path.join(__dirname, '..', '..', 'commandes');
    const categories = ordreCategories.filter(cat => fs.existsSync(path.join(commandesPath, cat)));

    const getEmbed = (cat) => {
        const files = fs.readdirSync(path.join(commandesPath, cat)).filter(f => f.endsWith('.js'));
        const commandInfos = files.map(f => {
            const cmd = require(path.join(commandesPath, cat, f));
            let name = null;
            if (cmd && cmd.data && cmd.data.name) name = `/${cmd.data.name}`;
            else if (cmd && cmd.name) name = `!${cmd.name}`;
            if (name && name !== '!model') {
                const desc = cmd.description ? `\n> ${cmd.description}` : '';
                return `\`${name.replace(/_/g, ' ')}\`${desc}`;
            }
            return null;
        }).filter(Boolean);
        return new EmbedBuilder()
            .setTitle(`\`❓\` Aide - ${cat.replace(/_/g, ' ')}`)
            .setDescription(commandInfos.join('\n\n') || "Aucune commande trouvée.")
            .setColor(getEmbedColor())
            .setFooter({ text: `développé par Vicieu • ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` });
    };

    const select = new StringSelectMenuBuilder()
        .setCustomId('select_cat')
        .setPlaceholder('Choisis une catégorie')
        .addOptions(categories.map(cat => ({
            label: `${categoryEmojis[cat] || ''} ${cat.replace(/_/g, ' ')}`,
            value: cat
        })));

    const row = new ActionRowBuilder().addComponents(select);

    const message = await context.reply({ embeds: [getEmbed(categories[0])], components: [row] });

    const collector = message.createMessageComponentCollector({ time: 60000 });
    collector.on('collect', async i => {
        if (i.customId === 'select_cat') {
            const cat = i.values[0];
            await i.update({ embeds: [getEmbed(cat)], components: [row] });
        }
    });
    collector.on('end', async () => {
        try { await message.edit({ components: [] }); } catch {}
    });
}