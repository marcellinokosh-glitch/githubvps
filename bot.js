// Imports uniques en haut du fichier
const fs = require('fs');
const path = require('path');
console.log('=== Début du script bot.js (MongoDB + Discord.js minimal) ===');
require('dotenv').config();
const mongoose = require('mongoose');
const { Client, GatewayIntentBits } = require('discord.js');
const GuildConfig = require('./commandes/configuration_serveur/guildConfig');

const playdl = require('play-dl');
console.log('[DEBUG] Méthodes cookies play-dl:', {
  setCookieFile: typeof playdl.setCookieFile,
  setCookiesFromFile: typeof playdl.setCookiesFromFile,
  cookies: typeof playdl.cookies
});
console.log('[DEBUG] SPOTIFY_CLIENT_ID =', process.env.SPOTIFY_CLIENT_ID);
console.log('[DEBUG] SPOTIFY_CLIENT_SECRET =', process.env.SPOTIFY_CLIENT_SECRET ? '[OK]' : '[ABSENT]');
if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
  playdl.setToken({
    spotify: {
      client_id: process.env.SPOTIFY_CLIENT_ID,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET
    }
  });
  console.log('Identifiants Spotify chargés pour play-dl.');
} else {
  console.warn('SPOTIFY_CLIENT_ID ou SPOTIFY_CLIENT_SECRET manquant dans .env. Les liens Spotify ne fonctionneront pas.');
}

// Chargement des cookies YouTube pour play-dl (si le fichier existe)
const cookiesPath = './youtube_cookies.txt';
if (fs.existsSync(cookiesPath)) {
  let cookiesLoaded = false;
  try {
    if (typeof playdl.setCookiesFromFile === 'function') {
      playdl.setCookiesFromFile(cookiesPath);
      console.log('Cookies YouTube chargés avec setCookiesFromFile pour play-dl.');
      cookiesLoaded = true;
    }
  } catch (e) {
    console.warn('setCookiesFromFile a échoué :', e.message || e);
  }
  if (!cookiesLoaded) {
    try {
      if (typeof playdl.setCookieFile === 'function') {
        playdl.setCookieFile(cookiesPath);
        console.log('Cookies YouTube chargés avec setCookieFile pour play-dl.');
        cookiesLoaded = true;
      }
    } catch (e) {
      console.warn('setCookieFile a échoué :', e.message || e);
    }
  }
  if (!cookiesLoaded) {
    console.warn('Aucune méthode compatible trouvée pour charger les cookies YouTube dans play-dl.');
  }
} else {
  console.warn('Fichier youtube_cookies.txt non trouvé. Certaines vidéos YouTube protégées peuvent ne pas fonctionner.');
}

// Gestion .update-reload après les imports
const updateFlagFile = path.join(__dirname, '.update-reload');
let shouldSendUpdateLog = false;
if (fs.existsSync(updateFlagFile)) {
  shouldSendUpdateLog = true;
  try { fs.unlinkSync(updateFlagFile); } catch {}
}
// Gestion arrêt propre : envoie un message dans le salon uptime
async function handleBotShutdown(signal) {
  await sendUptimeLog({
    client,
    status: 'hors ligne',
    color: 0xED4245,
    extra: `Arrêté le <t:${Math.floor(Date.now()/1000)}:f>\nRaison : ${signal || 'process.exit()'}`
  });
}

// Intercepte SIGINT/SIGTERM et process.exit
['SIGINT', 'SIGTERM'].forEach(sig => {
  process.on(sig, async () => {
    await handleBotShutdown(sig);
    process.exit(0);
  });
});
const originalExit = process.exit;
process.exit = async function(code) {
  await handleBotShutdown('process.exit');
  originalExit.call(process, code);
};
// Fonction utilitaire pour obtenir la couleur des embeds
function getEmbedColor() {
  let color = "#5865F2";
  try {
    color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
    // Si la couleur commence par #, la convertir en nombre pour Discord.js
    if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
  } catch {}
  return color;
}
async function sendUptimeLog({ client, status, color = null, extra = '' }) {
  try {
    const uptimeFile = path.join(__dirname, 'uptime_channel.json');
    if (!fs.existsSync(uptimeFile)) return;
    const { channelId } = JSON.parse(fs.readFileSync(uptimeFile, 'utf8'));
    if (!channelId) return;
    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;
    const { EmbedBuilder } = require('discord.js');
    const embed = new EmbedBuilder()
      .setTitle('`🔔` État du bot')
      .setDescription(`Le bot est **${status}**\n${extra}`)
      .setColor(color ?? getEmbedColor())
      .setTimestamp();
    await channel.send({ embeds: [embed] });
  } catch (e) {
    console.error('[uptime log] Impossible d\'envoyer le log uptime :', e);
  }
}

const DEFAULT_PREFIX = '!';

const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent
] });

// Handler pour les interactions (slash commands)
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  console.log('[slash] interaction reçue :', interaction.commandName);
  const command = client.slashCommands.get(interaction.commandName);
  if (!command || typeof command.execute !== 'function') {
    console.warn(`[slash] Commande non trouvée ou sans execute : ${interaction.commandName}`);
    return;
  }
  // Permissions avancées (si définies dans la commande)
  if (command.permissions && interaction.guild && interaction.member && !interaction.member.permissions.has(command.permissions)) {
  const { MessageFlags } = require('discord.js');
  return interaction.reply({ content: '❌ Tu n\'as pas la permission d\'utiliser cette commande.', flags: MessageFlags.Ephemeral });
  }
  try {
    await command.execute(interaction);
    console.log(`[slash] Commande exécutée : ${interaction.commandName}`);
  } catch (error) {
    console.error(`[slash] Erreur dans ${interaction.commandName} :`, error);
    if (!interaction.replied && !interaction.deferred) {
  const { MessageFlags } = require('discord.js');
  await interaction.reply({ content: '❌ Erreur lors de l\'exécution de la commande.', flags: MessageFlags.Ephemeral });
    }
  }
});

// Système de chargement dynamique des commandes (textuelles et slash)
client.commands = new Map();
client.slashCommands = new Map();
function loadCommands() {
  client.commands.clear();
  client.slashCommands.clear();
  const commandesPath = path.join(__dirname, 'commandes');
  fs.readdirSync(commandesPath).forEach(categorie => {
    const categoriePath = path.join(commandesPath, categorie);
    if (fs.statSync(categoriePath).isDirectory()) {
      fs.readdirSync(categoriePath).forEach(file => {
        if (file.endsWith('.js')) {
          const filePath = path.join(categoriePath, file);
          delete require.cache[require.resolve(filePath)];
          const command = require(filePath);
          // Commande textuelle
          if (command && command.name && typeof command.execute === 'function') {
            client.commands.set(command.name, command);
          }
          // Commande slash
          if (command && command.data && command.data.name && typeof command.execute === 'function') {
            client.slashCommands.set(command.data.name, command);
          }
        }
      });
    }
  });
  console.log(`✅ ${client.commands.size} commandes textuelles, ${client.slashCommands.size} slash commands chargées.`);
}
// Chargement initial
loadCommands();

// Nouveau handler messageCreate (text commands, permissions, préfixe dynamique)
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  let prefix = DEFAULT_PREFIX;
  if (message.guild) {
    try {
      const config = await GuildConfig.findOne({ guildId: message.guild.id });
      if (config && config.prefix) prefix = config.prefix;
    } catch (e) {}
  }
  // Répond à la mention du bot avec le préfixe
  if (message.mentions.has(client.user) && message.content.trim().match(new RegExp(`^<@!?${client.user.id}>$`))) {
    return message.reply(`Mon préfixe ici est : \`${prefix}\``);
  }
  // Gestion des commandes textuelles
  if (!message.content.startsWith(prefix)) return;
  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();
  const command = client.commands.get(commandName);
  if (!command || typeof command.execute !== 'function') return;
  // Permissions avancées (si définies dans la commande)
  if (command.permissions && message.guild && !message.member.permissions.has(command.permissions)) {
    return message.reply('❌ Tu n\'as pas la permission d\'utiliser cette commande.');
  }
  try {
    await command.execute(message, args, prefix);
  } catch (error) {
    console.error(error);
    message.reply('❌ Erreur lors de l\'exécution de la commande.');
  }
});

// Pour snipe
const snipe = require('./commandes/utilitaire/snipe.js');
const editsnipe = require('./commandes/utilitaire/editsnipe.js');

// Stockage global pour les snipes
global.lastDeleted = {};
global.lastEdit = {};

// Message supprimé
client.on('messageDelete', msg => {
    if (msg.partial || !msg.content) return;
    global.lastDeleted[msg.channel.id] = {
        content: msg.content,
        author: msg.author.tag,
        time: new Date().toLocaleTimeString()
    };
});

// Message édité
client.on('messageUpdate', (oldMsg, newMsg) => {
    if (oldMsg.partial || newMsg.partial || !oldMsg.content || !newMsg.content) return;
    global.lastEdit[oldMsg.channel.id] = {
        old: oldMsg.content,
        new: newMsg.content,
        author: oldMsg.author.tag,
        time: new Date().toLocaleTimeString()
    };
});



console.log('Tentative de connexion MongoDB...');
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connexion MongoDB réussie !');
    console.log('Tentative de connexion Discord...');
    client.login(process.env.TOKEN)
      .then(async () => {
        console.log('✅ Connecté à Discord !');
        // Envoie le log d'état dans le salon uptime
        if (shouldSendUpdateLog) {
          await sendUptimeLog({
            client,
            status: 'mis à jour',
            color: 0x3498DB,
            extra: `Le bot vient d'être mis à jour et relancé le <t:${Math.floor(Date.now()/1000)}:f>`
          });
        } else {
          await sendUptimeLog({
            client,
            status: 'en ligne',
            color: 0x57F287,
            extra: `Démarré le <t:${Math.floor(Date.now()/1000)}:f>`
          });
        }
      })
      .catch(err => {
        console.error('❌ Erreur Discord :', err);
        process.exit(1);
      });
  })
  .catch(err => {
    console.error('❌ Erreur MongoDB :', err);
    process.exit(1);
  });