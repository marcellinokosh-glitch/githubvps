const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fichier permissions (à la racine du projet ou adapte le chemin)
const permPath = path.join(__dirname, '..', '..', 'permissions.json');

// Grades possibles
const gradeChoices = [
    { label: 'DEV', value: 'dev' },
    { label: 'OWNER', value: 'owner' },
    { label: 'WL', value: 'wl' },
    { label: 'Tous le monde', value: 'everyone' }
];

// Charger les permissions actuelles
function getPermissions() {
    try {
        return JSON.parse(fs.readFileSync(permPath, 'utf8'));
    } catch {
        return {};
    }
}
function savePermissions(obj) {
    fs.writeFileSync(permPath, JSON.stringify(obj, null, 2));
}
function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

// Récupérer toutes les commandes du bot
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

module.exports = {
    name: "setperm",
    description: "Gère dynamiquement le grade requis pour chaque commande",
    data: new SlashCommandBuilder()
        .setName('setperm')
        .setDescription("Gère dynamiquement le grade requis pour chaque commande"),
    async execute(context) {
        try {
            // Seuls les dev peuvent gérer les permissions
            const { hasGrade } = require('../../utils/grades');
            const userId = context.user?.id || context.author?.id;
            if (!hasGrade(userId, 'dev')) {
                return context.reply({ content: "❌ Seuls les développeurs du bot peuvent gérer les permissions.", flags: 64 });
            }

            let permissions = getPermissions();
            const allCommands = getAllCommands();

            let currentIndex = 0;

            const getEmbed = (idx) => {
                const cmd = allCommands[idx];
                let grade = permissions[cmd];
                let gradeText = Array.isArray(grade) && grade.length > 0
                    ? grade.map(g => g.toUpperCase()).join(', ')
                    : "TOUS LE MONDE";
                return new EmbedBuilder()
                    .setTitle(`Permissions de la commande /${cmd}`)
                    .setDescription(`Grade actuel : **${gradeText}**`)
                    .setFooter({ text: `Commande ${idx + 1} / ${allCommands.length}` })
                    .setColor(getEmbedColor());
            };

            const getRow = (idx) => {
                const select = new StringSelectMenuBuilder()
                    .setCustomId('grade_select')
                    .setPlaceholder('Choisis un grade')
                    .addOptions(gradeChoices);

                const row1 = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('prev').setLabel('⬅️').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('next').setLabel('➡️').setStyle(ButtonStyle.Primary)
                );
                const row2 = new ActionRowBuilder().addComponents(select);

                return [row1, row2];
            };

            const message = await context.reply({
                embeds: [getEmbed(currentIndex)],
                components: getRow(currentIndex)
            });

            const collector = message.createMessageComponentCollector({ time: 120000 });

            collector.on('collect', async i => {
                if (i.user.id !== userId) return i.reply({ content: "Tu n'es pas autorisé à modifier.", ephemeral: true });

                if (i.customId === 'prev') {
                    currentIndex = (currentIndex - 1 + allCommands.length) % allCommands.length;
                    await i.update({ embeds: [getEmbed(currentIndex)], components: getRow(currentIndex) });
                } else if (i.customId === 'next') {
                    currentIndex = (currentIndex + 1) % allCommands.length;
                    await i.update({ embeds: [getEmbed(currentIndex)], components: getRow(currentIndex) });
                } else if (i.customId === 'grade_select') {
                    let cmd = allCommands[currentIndex];
                    let value = i.values[0];
                    if (value === 'everyone') {
                        delete permissions[cmd];
                    } else {
                        permissions[cmd] = [value];
                    }
                    savePermissions(permissions);
                    await i.update({ embeds: [getEmbed(currentIndex)], components: getRow(currentIndex) });
                }
            });

            collector.on('end', async () => {
                try { await message.edit({ components: [] }); } catch {}
            });
        } catch (err) {
            console.error("Erreur dans setperm :", err); // <-- Cette ligne affiche l'erreur réelle
            return context.reply({ content: "❌ Erreur lors de l'exécution de la commande." });
        }
    }
};