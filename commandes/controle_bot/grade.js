const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const gradesPath = path.join(__dirname, '..', '..', 'grades.json');

// Utilitaires
function getGrades() {
    try {
        return JSON.parse(fs.readFileSync(gradesPath, 'utf8'));
    } catch {
        return { dev: [], owner: [], wl: [] };
    }
}
function saveGrades(grades) {
    fs.writeFileSync(gradesPath, JSON.stringify(grades, null, 2));
}
function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

// Commande
module.exports = {
    name: "grade",
    description: "Gère les grades dev/owner/wl (add, remove, list)",
    data: new SlashCommandBuilder()
        .setName('grade')
        .setDescription("Gère les grades dev/owner/wl")
        .addSubcommand(sub =>
            sub.setName('add')
                .setDescription('Ajoute un utilisateur à un grade')
                .addStringOption(opt =>
                    opt.setName('grade')
                        .setDescription('dev, owner ou wl')
                        .setRequired(true)
                        .addChoices(
                            { name: 'dev', value: 'dev' },
                            { name: 'owner', value: 'owner' },
                            { name: 'wl', value: 'wl' }
                        )
                )
                .addUserOption(opt =>
                    opt.setName('utilisateur')
                        .setDescription('Utilisateur à ajouter')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('remove')
                .setDescription('Retire un utilisateur d\'un grade')
                .addStringOption(opt =>
                    opt.setName('grade')
                        .setDescription('dev, owner ou wl')
                        .setRequired(true)
                        .addChoices(
                            { name: 'dev', value: 'dev' },
                            { name: 'owner', value: 'owner' },
                            { name: 'wl', value: 'wl' }
                        )
                )
                .addUserOption(opt =>
                    opt.setName('utilisateur')
                        .setDescription('Utilisateur à retirer')
                        .setRequired(true)
                )
        )
        .addSubcommand(sub =>
            sub.setName('list')
                .setDescription('Liste les utilisateurs d\'un grade')
                .addStringOption(opt =>
                    opt.setName('grade')
                        .setDescription('dev, owner ou wl')
                        .setRequired(true)
                        .addChoices(
                            { name: 'dev', value: 'dev' },
                            { name: 'owner', value: 'owner' },
                            { name: 'wl', value: 'wl' }
                        )
                )
        ),
    async execute(context, args) {
        const isSlash = !!context.isChatInputCommand;
        const userId = isSlash ? context.user.id : context.author.id;
        // Seuls les dev peuvent gérer les grades
        const { hasGrade } = require('../../utils/grades');
        if (!hasGrade(userId, 'dev')) {
            const reply = "❌ Seuls les développeurs du bot peuvent gérer les grades.";
            if (isSlash) return context.reply({ content: reply, flags: 64 });
            else return context.reply(reply);
        }

        // Récupération des paramètres
        let sub, grade, targetId;
        if (isSlash) {
            sub = context.options.getSubcommand();
            grade = context.options.getString('grade');
            if (sub !== 'list') targetId = context.options.getUser('utilisateur').id;
        } else {
            sub = args[0];
            grade = args[1];
            targetId = args[2]?.replace(/[<@!>]/g, '');
        }

        if (!['add', 'remove', 'list'].includes(sub) || !['dev', 'owner', 'wl'].includes(grade)) {
            const reply = "Utilisation : `/grade add|remove|list dev|owner|wl @user`";
            if (isSlash) return context.reply({ content: reply, flags: 64 });
            else return context.reply(reply);
        }

        let grades = getGrades();

        if (sub === 'add') {
            if (!targetId) {
                const reply = "Merci de mentionner un utilisateur à ajouter.";
                if (isSlash) return context.reply({ content: reply, flags: 64 });
                else return context.reply(reply);
            }
            if (!grades[grade].includes(targetId)) {
                grades[grade].push(targetId);
                saveGrades(grades);
            }
            const reply = `<@${targetId}> a été ajouté au grade **${grade}**.`;
            return context.reply({ content: reply });
        }

        if (sub === 'remove') {
            if (!targetId) {
                const reply = "Merci de mentionner un utilisateur à retirer.";
                if (isSlash) return context.reply({ content: reply, flags: 64 });
                else return context.reply(reply);
            }
            grades[grade] = grades[grade].filter(id => id !== targetId);
            saveGrades(grades);
            const reply = `<@${targetId}> a été retiré du grade **${grade}**.`;
            return context.reply({ content: reply });
        }

        if (sub === 'list') {
            const ids = grades[grade];
            const embed = new EmbedBuilder()
                .setTitle(`Utilisateurs du grade ${grade}`)
                .setDescription(ids.length ? ids.map(id => `<@${id}>`).join('\n') : "Aucun utilisateur.")
                .setColor(getEmbedColor());
            return context.reply({ embeds: [embed] });
        }
    }
};