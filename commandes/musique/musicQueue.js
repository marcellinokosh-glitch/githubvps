// Gestionnaire de file d'attente musique pour chaque serveur
class MusicQueue {
  constructor() {
    this.queues = new Map(); // guildId => { queue: [], connection, player, ... }
  }

  get(guildId) {
    if (!this.queues.has(guildId)) {
      this.queues.set(guildId, { queue: [], connection: null, player: null, volume: 1, nowPlaying: null });
    }
    return this.queues.get(guildId);
  }

  clear(guildId) {
    this.queues.delete(guildId);
  }
}

module.exports = new MusicQueue();
