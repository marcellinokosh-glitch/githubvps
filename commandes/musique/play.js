const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, NoSubscriberBehavior, getVoiceConnection } = require('@discordjs/voice');
const playdl = require('play-dl');
const ytdl = require('ytdl-core');
const musicQueue = require('./musicQueue');
const SpotifyWebApi = require('spotify-web-api-node');
const fs = require('fs');

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET
});

function getEmbedColor() {
    let color = "#5865F2";
    try {
        color = fs.readFileSync('./embed_color.txt', 'utf8').trim();
        if (color.startsWith('#')) color = parseInt(color.slice(1), 16);
    } catch {}
    return color;
}

module.exports = {
  name: "play",
  description: "Joue une musique ou l’ajoute à la file d’attente",
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription("Joue une musique ou l’ajoute à la file d’attente")
    .addStringOption(option =>
      option.setName('query')
        .setDescription('Lien ou recherche YouTube/SoundCloud/Spotify')
        .setRequired(true)
    ),
  async execute(interaction) {
    const { MessageFlags } = require('discord.js');
    const query = interaction.options.getString('query');
    const member = interaction.member;
    const voiceChannel = member.voice && member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '❌ Tu dois être dans un salon vocal pour utiliser cette commande.', flags: MessageFlags.Ephemeral });
    }

    await interaction.reply({ content: 'Recherche de la musique...', flags: MessageFlags.Ephemeral });

    // Détection du type d'entrée (lien ou recherche texte)
    let trackInfo;
    try {
      if (playdl.is_expired()) await playdl.refreshToken();
      const urlPattern = /^(https?:\/\/)?([\w.-]+)\.[a-z]{2,}(\/\S*)?$/i;
      if (urlPattern.test(query)) {
        // Lien direct
        if (playdl.yt_validate(query) === 'video') {
          // Lien YouTube vidéo
          const ytInfo = await playdl.video_basic_info(query);
          trackInfo = {
            url: ytInfo.video_details.url,
            title: ytInfo.video_details.title,
            duration: ytInfo.video_details.durationRaw,
            thumbnail: ytInfo.video_details.thumbnails[0]?.url || null,
            source: 'YouTube',
            isYouTube: true
          };
        } else if (playdl.sp_validate(query) === 'track') {
          // Lien Spotify track → recherche YouTube
          // Authentification client credentials
          const match = query.match(/track\/([a-zA-Z0-9]+)/);
          if (!match) return interaction.editReply({ content: '❌ Lien Spotify invalide.' });
          const trackId = match[1];
          try {
            const data = await spotifyApi.clientCredentialsGrant();
            spotifyApi.setAccessToken(data.body['access_token']);
            const track = await spotifyApi.getTrack(trackId);
            const searchQuery = `${track.body.name} ${track.body.artists[0].name}`;
            const results = await playdl.search(searchQuery, { limit: 1 });
            if (!results || results.length === 0) {
              return interaction.editReply({ content: '❌ Aucun résultat YouTube trouvé pour ce morceau Spotify.' });
            }
            const res = results[0];
            trackInfo = {
              url: res.url,
              title: res.title,
              duration: res.durationRaw,
              thumbnail: res.thumbnails?.[0]?.url || null,
              source: 'YouTube (via Spotify)'
            };
          } catch (e) {
            return interaction.editReply({ content: `❌ Erreur lors de la conversion Spotify → YouTube.\n${e.message || e}` });
          }
        } else if (playdl.so_validate(query) === 'track') {
          // Lien SoundCloud track
          const soInfo = await playdl.soundcloud(query);
          trackInfo = {
            url: soInfo.url,
            title: soInfo.name,
            duration: soInfo.durationRaw,
            thumbnail: soInfo.thumbnail,
            source: 'SoundCloud'
          };
        } else {
          return interaction.editReply({ content: '❌ Lien non supporté ou non reconnu (YouTube, Spotify, SoundCloud uniquement).' });
        }
      } else {
        // Recherche texte
        const results = await playdl.search(query, { limit: 1 });
        if (!results || results.length === 0) {
          return interaction.editReply({ content: '❌ Aucun résultat trouvé pour ta recherche.' });
        }
        const res = results[0];
        trackInfo = {
          url: res.url,
          title: res.title,
          duration: res.durationRaw,
          thumbnail: res.thumbnails?.[0]?.url || null,
          source: res.source || 'YouTube'
        };
      }
    } catch (err) {
      return interaction.editReply({ content: `❌ Erreur lors de la recherche de la musique.\n${err.message || err}` });
    }

    // Ajoute à la file d'attente
    const queue = musicQueue.get(interaction.guildId);
    queue.queue.push({ trackInfo, requestedBy: interaction.user });

    // Si rien ne joue, lance la lecture
    if (!queue.player || queue.player.state.status === AudioPlayerStatus.Idle) {
      try {
        // Connexion vocale
        let connection = getVoiceConnection(interaction.guildId);
        if (!connection) {
          connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: interaction.guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator,
            selfDeaf: true
          });
        }

        // Création du player
        const player = createAudioPlayer({
          behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause
          }
        });
        queue.player = player;
        queue.connection = connection;
        connection.subscribe(player);

        // Fonction pour jouer la musique suivante
        const playNext = async () => {
          if (queue.queue.length === 0) {
            player.stop();
            return;
          }
          const next = queue.queue.shift();
          let stream;
          try {
            if (next.trackInfo.isYouTube) {
              stream = { stream: ytdl(next.trackInfo.url, { filter: 'audioonly', quality: 'highestaudio' }), type: undefined };
            } else {
              stream = await playdl.stream(next.trackInfo.url);
            }
          } catch (e) {
            await interaction.followUp({ content: `❌ Impossible de lire ${next.trackInfo.title} :\n${e.message || e}`, flags: MessageFlags.Ephemeral });
            return playNext();
          }
          const resource = createAudioResource(stream.stream, { inputType: stream.type });
          player.play(resource);
          queue.nowPlaying = next;
        };

        player.on(AudioPlayerStatus.Idle, playNext);
        player.on('error', error => {
          interaction.followUp({ content: `❌ Erreur de lecture : ${error.message}`, flags: MessageFlags.Ephemeral });
          playNext();
        });

        await playNext();
        await interaction.editReply({ content: `▶️ Lecture de **${trackInfo.title}** ajoutée à la file !` });
      } catch (err) {
        return interaction.editReply({ content: '❌ Erreur lors de la connexion ou de la lecture.' });
      }
    } else {
      await interaction.editReply({ content: `▶️ **${trackInfo.title}** ajoutée à la file d'attente !` });
    }
  }
};
