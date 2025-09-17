const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');

const permPath = path.join(__dirname, '..', '..', 'permissions.json');

function getPermissions() {
    try {
        return JSON.parse(fs.readFileSync(permPath, 'utf8'));
    } catch {
        return {};
    }
}
function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}
function getAllCommands() {
    const commandesPath = path.join(__dirname, '..', '..', 'commandes');
    let allCommands = [];
    const categories = fs.readdirSync(commandesPath).filter(cat => fs.statSync(path.join(commandesPath, cat)).isDirectory());
    for (const cat of categories) {
        const files = fs.readdirSync(path.join(commandesPath, cat)).filter(f => f.endsWith('.js'));
        for (const file of files) {
            try {
                const cmd = require(path.join(commandesPath, cat, file));
                if (cmd && (cmd.data?.name || cmd.name)) {
                    allCommands.push(cmd.data?.name || cmd.name);
                }
            } catch {}
        }
    }
    return [...new Set(allCommands)];
}

function groupByPerm(allCommands, permissions) {
    const byDev = [];
    const byOwner = [];
    const byWl = [];
    const byEveryone = [];
    for (const cmd of allCommands) {
        const grades = permissions[cmd];
        if (grades && grades.includes('dev')) byDev.push(cmd);
        else if (grades && grades.includes('owner')) byOwner.push(cmd);
        else if (grades && grades.includes('wl')) byWl.push(cmd);
        else byEveryone.push(cmd);
    }
    return [byDev, byOwner, byWl, byEveryone];
}

module.exports = {
    name: "permissions",
    description: "Affiche les grades requis pour chaque commande",
    data: new SlashCommandBuilder()
        .setName('permissions')
        .setDescription("Affiche les grades requis pour chaque commande"),
    async execute(context) {
        const allCommands = getAllCommands();
        const permissions = getPermissions();
        const [devCmds, ownerCmds, wlCmds, everyoneCmds] = groupByPerm(allCommands, permissions);

        const pages = [
            {
                title: "Commandes réservées aux DEV",
                cmds: devCmds,
                grade: "dev"
            },
            {
                title: "Commandes réservées aux OWNER",
                cmds: ownerCmds,
                grade: "owner"
            },
            {
                title: "Commandes réservées aux WL",
                cmds: wlCmds,
                grade: "wl"
            },
            {
                title: "Commandes accessibles à tous",
                cmds: everyoneCmds,
                grade: null
            }
        ];

        const getEmbed = (pageIndex) => {
            const page = pages[pageIndex];
            let desc = '';
            for (const cmd of page.cmds) {
                let grades = permissions[cmd];
                let gradeText = Array.isArray(grades) && grades.length > 0
                    ? grades.map(g => g.toUpperCase()).join(', ')
                    : "tous le monde";
                desc += `\`/${cmd}\` : **${gradeText}**\n`;
            }
            if (!desc) desc = "Aucune commande trouvée.";
            return new EmbedBuilder()
                .setTitle(page.title)
                .setDescription(desc)
                .setFooter({ text: `Page ${pageIndex + 1} / ${pages.length}` })
                .setColor(getEmbedColor());
        };

        let pageIndex = 0;
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
            new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
        );

        const message = await context.reply({ embeds: [getEmbed(pageIndex)], components: [row] });

        const collector = message.createMessageComponentCollector({ time: 60000 });
        collector.on('collect', async i => {
            if (i.customId === 'prev') pageIndex = (pageIndex - 1 + pages.length) % pages.length;
            if (i.customId === 'next') pageIndex = (pageIndex + 1) % pages.length;
            await i.update({ embeds: [getEmbed(pageIndex)], components: [row] });
        });
        collector.on('end', async () => {
            try { await message.edit({ components: [] }); } catch {}
        });
    }
};