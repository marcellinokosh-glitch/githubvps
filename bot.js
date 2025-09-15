require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const TOKEN = process.env.TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const chokidar = require('chokidar');
const { exec } = require('child_process');
const mongoose = require('mongoose');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const commandesPath = path.join(__dirname, 'commandes');
fs.readdirSync(commandesPath).forEach(categorie => {
    const categoriePath = path.join(commandesPath, categorie);
    fs.readdirSync(categoriePath).forEach(file => {
        if (file.endsWith('.js')) {
            const command = require(path.join(categoriePath, file));
            // Ajoute si commande slash (data.name) ou prefix (name)
            if (command && command.data && command.data.name) {
                client.commands.set(command.data.name, command);
            } else if (command && command.name) {
                client.commands.set(command.name, command);
            }
            // Sinon, ignore silencieusement
        }
    });
});

const uptimeFile = path.join(__dirname, 'uptime_channel.json');
let uptimeChannelId = null;
if (fs.existsSync(uptimeFile)) {
    const data = JSON.parse(fs.readFileSync(uptimeFile, 'utf8'));
    uptimeChannelId = data.channelId;
}

function sendUptimeMessage(client, content) {
    if (!content || typeof content !== 'string' || content.trim() === '') return; // Ajout de la vérification
    if (uptimeChannelId) {
        const channel = client.channels.cache.get(uptimeChannelId);
        if (channel) channel.send({ content }).catch(() => {});
    }
}

function sendUptimeEmbed(client, embed) {
    if (uptimeChannelId) {
        const channel = client.channels.cache.get(uptimeChannelId);
        if (channel) channel.send({ embeds: [embed] }).catch(() => {});
    }
}

const uptimeMessageFile = path.join(__dirname, 'uptime_message.json');

client.once('clientReady', async () => {
    console.log('🚀 Le bot est lancé !');

    // Embed démarrage
    if (uptimeChannelId) {
        const { EmbedBuilder } = require('discord.js');
        const startEmbed = new EmbedBuilder()
            .setTitle('🟢 Le bot vient de démarrer !')
            .setDescription('Le bot est en ligne et prêt à fonctionner.')
            .setColor(0x57F287)
            .setTimestamp();
        const channel = client.channels.cache.get(uptimeChannelId);
        if (channel) channel.send({ embeds: [startEmbed] }).catch(() => {});
    }

    // Envoie ou modifie l'embed de redémarrage dans le salon uptime
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
        .setTitle('✅ Redémarrage terminé')
        .setDescription('Le bot a bien redémarré et est opérationnel !')
        .setColor(0x57F287)
        .setTimestamp();

    if (uptimeChannelId) {
        const channel = client.channels.cache.get(uptimeChannelId);
        let messageId = null;

        // Essaie de lire l'ID du message précédent
        if (fs.existsSync(uptimeMessageFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(uptimeMessageFile, 'utf8'));
                messageId = data.messageId;
            } catch {}
        }

        try {
            if (messageId) {
                // Essaie de modifier le message existant
                const msg = await channel.messages.fetch(messageId);
                await msg.edit({ embeds: [embed] });
            } else {
                // Sinon, envoie un nouveau message et sauvegarde son ID
                const msg = await channel.send({ embeds: [embed] });
                fs.writeFileSync(uptimeMessageFile, JSON.stringify({ messageId: msg.id }, null, 2));
            }
        } catch {
            // Si le message n'existe plus, envoie un nouveau message et sauvegarde son ID
            const msg = await channel.send({ embeds: [embed] });
            fs.writeFileSync(uptimeMessageFile, JSON.stringify({ messageId: msg.id }, null, 2));
        }
    }
});


process.on('beforeExit', () => {
    if (client && client.isReady() && uptimeChannelId) {
        const { EmbedBuilder } = require('discord.js');
        const stopEmbed = new EmbedBuilder()
            .setTitle('🔴 Le bot va s\'éteindre !')
            .setDescription('Le bot va s\'arrêter ou redémarrer.')
            .setColor(0xED4245)
            .setTimestamp();
        const channel = client.channels.cache.get(uptimeChannelId);
        if (channel) channel.send({ embeds: [stopEmbed] }).catch(() => {});
    }
});


process.on('uncaughtException', (err) => {
    if (client && client.isReady() && uptimeChannelId) {
        const { EmbedBuilder } = require('discord.js');
        const errorEmbed = new EmbedBuilder()
            .setTitle('❌ Erreur non gérée')
            .setDescription(`\`\`\`${err.stack}\`\`\``)
            .setColor(0xED4245)
            .setTimestamp();
        const channel = client.channels.cache.get(uptimeChannelId);
        if (channel) channel.send({ embeds: [errorEmbed] }).catch(() => {});
    }
});


fs.watch(__filename, () => {
    if (client && client.isReady() && uptimeChannelId) {
        const { EmbedBuilder } = require('discord.js');
        const reloadEmbed = new EmbedBuilder()
            .setTitle('🛠️ Code rechargé')
            .setDescription('Le code du bot a été modifié et rechargé.')
            .setColor(0x5865F2)
            .setTimestamp();
        const channel = client.channels.cache.get(uptimeChannelId);
        if (channel) channel.send({ embeds: [reloadEmbed] }).catch(() => {});
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({ content: 'Erreur lors de l\'exécution de la commande.', flags: 64 });
        }
    }
});


const GuildConfig = require('./commandes/configuration_serveur/guildConfig');
const DEFAULT_PREFIX = '!';


client.on('messageCreate', async message => {
    if (message.author.bot) return;

    // Récupère le préfixe personnalisé ou par défaut
    let prefix = DEFAULT_PREFIX;
    try {
        if (message.guild) {
            const config = await GuildConfig.findOne({ guildId: message.guild.id });
            if (config && config.prefix) prefix = config.prefix;
        }
    } catch (e) {
        // ignore erreur mongo, fallback sur le préfixe par défaut
    }

    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
        // Crée un faux "interaction" pour compatibilité
        await command.execute({
            user: message.author,
            member: message.member,
            guild: message.guild,
            channel: message.channel,
            client: client,
            reply: (options) => {
                if (typeof options === 'string') return message.reply(options);
                if (options.embeds) return message.reply({ embeds: options.embeds });
                if (options.content) return message.reply(options.content);
                return message.reply('Réponse vide.');
            },
            options: {
                getString: () => args[0] // Prend le premier argument comme option string
            },
            isChatInputCommand: () => false
        });
    } catch (error) {
        console.error(error);
        message.reply('Erreur lors de l\'exécution de la commande.');
    }
});

// Fonction pour charger toutes les commandes
function loadCommands() {
    client.commands.clear();
    fs.readdirSync(commandesPath).forEach(categorie => {
        const categoriePath = path.join(commandesPath, categorie);
        fs.readdirSync(categoriePath).forEach(file => {
            if (file.endsWith('.js')) {
                delete require.cache[require.resolve(path.join(categoriePath, file))];
                const command = require(path.join(categoriePath, file));
                if (command && command.data && command.data.name) {
                    client.commands.set(command.data.name, command);
                } else if (command && command.name) {
                    client.commands.set(command.name, command);
                }
                // Sinon, ignore silencieusement
            }
        });
    });
}

// Chargement initial
loadCommands();

// Hot reload avec chokidar
chokidar.watch(commandesPath, { ignoreInitial: true })
    .on('add', () => deployCommands())
    .on('change', () => deployCommands())
    .on('unlink', () => deployCommands());

function deployCommands() {
    exec('node deploy-commands.js', (error, stdout, stderr) => {
        if (error) {
            console.error(`Erreur lors du déploiement des commandes : ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`Erreur : ${stderr}`);
            return;
        }
        console.log('✅ Commandes slash mises à jour automatiquement !');
    });
}

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ Connecté à MongoDB');
        client.login(TOKEN);
    })
    .catch(() => process.exit(1));