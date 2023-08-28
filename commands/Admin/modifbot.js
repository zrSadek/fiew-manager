const ms = require('ms')

module.exports = {
  name: "modifbot",
  aliases: ["modif"],
  description: "Modifie les paramètres du bot",
  usage: "modifbot <temps/owner> <valeur>",
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
    }
    const param = args[0];
    const valeur = args[1];

    if (param === "temps") {
      const botId = args[1];
      const temps = args[2]
      const expirationDate = Date.now() + parseTime(temps);
      const botExists = await checkBotExists(client, botId);

      if (!botExists) {
        return message.reply("Bot non trouvé dans la base de données !");
      }
      const bot = await client.users.fetch(botId);
      const namebot = bot ? bot.tag : "Bot introuvable";
      const botLink = `https://discord.com/api/oauth2/authorize?client_id=${botId}&permissions=8&scope=bot%20applications.commands`;
      const query = 'UPDATE Fiew SET temps = ? WHERE bot_id = ?';
      const values = [expirationDate.toString(), botId];

      client.db.run(query, values, (err) => {
        if (err) {
          console.error(err);
          return message.reply("Une erreur s'est produite.");
        }

        return message.reply(`Date d'expiration du bot \`${namebot}\` modifiée pour <t:${Math.floor(expirationDate / 1000)}:R>.`);
      });
    } else if (param === "owner") {
      const botId = args[1];
      const owner = args[2];

      if (!isValidSnowflake(botId)) {
        return message.reply("ID de bot invalide !");
      }

      const botExists = await checkBotExists(client, botId);

      const bot = await client.users.fetch(botId);
      const namebot = bot ? bot.tag : "Bot introuvable";
      const query = botExists ? 'UPDATE Fiew SET owner = ? WHERE bot_id = ?' : 'INSERT INTO Fiew (owner, bot_id) VALUES (?, ?)';
      const values = [owner, botId];

      client.db.run(query, values, (err) => {
        if (err) {
          console.error(err);
          return message.reply("Une erreur s'est produite.");
        }

        return message.reply(`L'owner du bot \`${namebot}\` est maintenant <@${owner}>.`);
      });
    } else {
      return message.reply(`Merci de l'utiliser : \`${prefix}modifbot <temps/owner> <valeur>\``);
    }
  }
}

async function checkBotExists(client, botId) {
  const query = 'SELECT COUNT(*) AS count FROM Fiew WHERE bot_id = ?';
  const values = [botId];

  return new Promise((resolve, reject) => {
    client.db.get(query, values, (err, row) => {
      if (err) {
        console.error(err);
        reject(err);
      } else {
        resolve(row.count > 0);
      }
    });
  });
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

function isValidSnowflake(id) {
  const snowflakeRegex = /^[0-9]{16,20}$/;
  return snowflakeRegex.test(id);
}
