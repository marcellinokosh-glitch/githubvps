const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, 'guildConfig.json');

function readConfig() {
    try {
        if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, '{}');
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
    } catch {
        return {};
    }
}

function writeConfig(data) {
    fs.writeFileSync(configPath, JSON.stringify(data, null, 2));
}

module.exports = {
    async findOne(query) {
        const data = readConfig();
        return data[query.guildId] ? { guildId: query.guildId, prefix: data[query.guildId] } : null;
    },
    async findOneAndUpdate(query, update, options) {
        const data = readConfig();
        data[query.guildId] = update.prefix;
        writeConfig(data);
        return { guildId: query.guildId, prefix: update.prefix };
    }
};