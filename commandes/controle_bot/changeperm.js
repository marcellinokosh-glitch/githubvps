const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

// Fichier permissions (à la racine du projet ou adapte le chemin)
const permPath = path.join(__dirname, '..', '..', 'permissions.json');

// Grades possibles
const gradeChoices = ['dev', 'owner', 'wl', 'everyone'];

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
    name: "changeperm",
    description: "Change dynamiquement le grade requis pour une commande",
    data: new SlashCommandBuilder()
        .setName('changeperm')
        .setDescription("Change dynamiquement le grade requis pour une commande")
        .addStringOption(option =>
            option.setName('commande')
                .setDescription('Nom de la commande')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('grade')
                .setDescription('Nouveau grade (dev, owner, wl, everyone)')
                .setRequired(true)
                .addChoices(
                    { name: 'dev', value: 'dev' },
                    { name: 'owner', value: 'owner' },
                    { name: 'wl', value: 'wl' },
                    { name: 'tous le monde', value: 'everyone' }
                )
        ),
    async execute(context, args) {
        // Seuls les dev peuvent gérer les permissions
        const { hasGrade } = require('../../utils/grades');
        const userId = context.user?.id || context.author?.id;
        if (!hasGrade(userId, 'dev')) {
            return context.reply({ content: "❌ Seuls les développeurs du bot peuvent gérer les permissions.", flags: 64 });
        }

        // Récupération des paramètres
        const isSlash = !!context.isChatInputCommand;
        const allCommands = getAllCommands();
        let cmdName, grade;
        if (isSlash) {
            cmdName = context.options.getString('commande');
            grade = context.options.getString('grade');
        } else {
            cmdName = args[0];
            grade = args[1];
        }

        if (!allCommands.includes(cmdName)) {
            return context.reply({ content: "❌ Cette commande n'existe pas.", flags: 64 });
        }
        if (!gradeChoices.includes(grade)) {
            return context.reply({ content: "❌ Grade invalide. Choisis entre dev, owner, wl, everyone.", flags: 64 });
        }

        let permissions = getPermissions();
        if (grade === 'everyone') {
            delete permissions[cmdName];
        } else {
            permissions[cmdName] = [grade];
        }
        savePermissions(permissions);

        return context.reply({ content: `✅ La permission de \`${cmdName}\` a été changée pour **${grade.toUpperCase()}**.` });
    }
};