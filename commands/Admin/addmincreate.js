const fs = require('fs');
const Discord = require('discord.js');
const now = new Date();
const config = require('../../config.json')
const timestamp = Math.floor(now.getTime() / 1000);
module.exports = {
  name: "admincreate",
  description: "Crée un bot perso",
  usage: "admincreate <token>",
  category: "Membres",
  userPerms: [],
  botPerms: [],
  cooldown: 0,
  guildOnly: false,
  maintenance: false,
  run: async (client, message, args, prefix) => {
    const isDeveloper = client.config.développeurs.includes(message.author.id);
    if (!isDeveloper) {
        return message.reply({ content: "Tu ne fais pas partie des développeurs !", ephemeral: true });
    }     const token = args[0];

    try {
      if (!token) {
        return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}admincreate <token>\``);
      }

      const bot = new Discord.Client({ intents: [377744] });

      await bot.login(token).catch((err) => {
        console.log(`Création du bot de ${message.author.username}, Erreur: Token invalide !`);
        message.reply({ content: '`❌` Votre token est invalide !' });
        return;
      });
      const botId = bot.user.id; 
      const botTag = bot.user.tag;


      bot.user.setPresence({
        activities: [
          { name: config.statuspersobot, type: Discord.ActivityType.Streaming, url: 'https://twitch.tv/oni145' }
        ]
      });

      const Fiew = 'Fiew';
      const owner = message.author.id;
      await message.reply("Je viens de terminer la création de votre bot.");
   
      const status = 'on';
      const temps = '30d';

      const parsedTime = parseTime(temps);
      if (!parsedTime) {
        console.log('Format incorrecte');
        return;
      }
      const expirationDate = Date.now() + parsedTime;


      client.db.run(
        'INSERT INTO Fiew (token, type, bot_id, status, owner, temps) VALUES (?, ?, ?, ?, ?, ?)',
        [token, Fiew, botId, status, owner, expirationDate]
      );
    } catch (error) {
    }
  }
}

function parseTime(timeString) {
  const regex = /(\d+)([smhdwy])/;
  const match = timeString.match(regex);
  if (!match) return null;
  const value = parseInt(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    case 'w':
      return value * 7 * 24 * 60 * 60 * 1000;
    case 'y':
      return value * 365 * 24 * 60 * 60 * 1000;
    default:
      return null;
  }
}

