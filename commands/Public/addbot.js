const fs = require('fs');
const Discord = require('discord.js');
const config = require('../../config.json')
const now = new Date();
const timestamp = Math.floor(now.getTime() / 1000);
module.exports = {
  name: "create",
  aliases: ["addbot"], 
  description: "Crée un bot avec une clée",
  usage: "create <token> <clé>",
  category: "Membres",
  userPerms: [],
  botPerms: [],
  cooldown: 0,
  guildOnly: false,
  maintenance: false,
  run: async (client, message, args, prefix) => {
    const token = args[0];
    const cle = args[1];

    try {
      if (!token || !cle) {
        return message.reply(`Utilisation incorrecte. Utilisez : \`${prefix}create/addbot <token> <clé>\``);
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
          { name: config.statuspersobot, type: 'STREAMING', url: 'https://twitch.tv/oni145' }
        ]
      });

      const Fiew = 'Fiew';
      const owner = message.author.id;

      let storedCles;
      try {
        storedCles = fs.readFileSync('Clée.txt', 'utf8').trim().split("\n").map((line) => line.trim());
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier Clees.txt :", error);
        return message.reply("Une erreur s'est produite.");
      }
      
      if (!storedCles || storedCles.length === 0) {
        return message.reply("Aucune clé n'a été trouvée.");
      }
      
      if (!storedCles.includes(cle)) {
        message.reply("`❌` Clé invalide, merci de contacter 1sown en message privé pour recevoir une nouvelle clé.");
        return;
      }
       const index = storedCles.indexOf(cle);
      if (index > -1) {
        storedCles.splice(index, 1);
      }
      
      fs.writeFileSync('Clée.txt', storedCles.join('\n'), 'utf8');
      const botLink = `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands`;
      await client.channels.cache.get(client.fiew.clee).send({embeds: [
        new Discord.EmbedBuilder()
        .setTitle('Activation d\'une clée')
        .setTimestamp()
        .setThumbnail(message.author.avatarURL())
        .setColor(client.config.color)
        .setFooter({text: client.config.footer, iconURL: client.user.avatarURL()})
        .addFields({name: 'Activeur', value: `[\`${message.author.username}\`](https://discord.com/users/${message.author.id}) - ([\`${message.author.id}\`](https://discord.com/users/${message.author.id}))`, inline: false})
        .addFields({name: 'Clée', value: `\`${cle}\``})
        .addFields({name: 'Bot Name', value: `[\`${botTag}\`](${botLink}) - [\`Invite Bot\`](${botLink})`})
        .addFields({name: 'Date', value: `<t:${timestamp}:R>`, inline: false})
      ]})

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
      await message.reply("Je viens de terminer la création de votre bot.");
    } catch (error) {
      message.reply('une erreur vient de ce produire : ' + error)
    }
  }
};

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

