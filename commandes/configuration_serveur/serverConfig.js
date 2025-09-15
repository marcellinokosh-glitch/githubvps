const mongoose = require('mongoose');

const serverConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  slashEnabled: { type: Boolean, default: true }
});

module.exports = mongoose.model('ServerConfig', serverConfigSchema);