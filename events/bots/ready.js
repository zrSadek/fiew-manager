const Discord = require('discord.js');
const Fiew = require('../../Fiew/Fiew');
const logs = require('../../Fiew')
const activeBots = new Map();
const activeBotTypes = [];
const now = new Date();
const timestamp = Math.floor(now.getTime() / 1000);

module.exports = async (client, interaction) => {
  setTimeout(() => {
    const startBots = async () => {
      try {
        const selectQuery = 'SELECT type, token, owner, bot_id, status, temps FROM Fiew';
        const rows = await new Promise((resolve, reject) => {
          client.db.all(selectQuery, (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows);
            }
          });
        });

        if (rows.length === 0) {
          return;
        }

        for (const [botId, activeBot] of activeBots.entries()) {
          const botExists = rows.some(row => row.bot_id === botId);
          if (!botExists) {
            activeBot.stop();
            activeBots.delete(botId);
            activeBotTypes.splice(activeBotTypes.indexOf(activeBot.type), 1);
            const logChannel = client.channels.cache.get(logs.stop);
            if (logChannel) {
              const bot = await client.users.fetch(botId);
              const embed = new Discord.EmbedBuilder()
                .setColor(client.config.color)
                .setTitle('Déconnexion du système')
                .setThumbnail(bot.displayAvatarURL())
                .setDescription(`**Déconnexion de** [\`${bot.tag}\`](https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=8&scope=bot%20applications.commands)\n┖ **Id :** (\`${bot.id}\`)\n ┖ **Date :** <t:${timestamp}:R> / <t:${timestamp}:F>`)
                .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
              logChannel.send({ embeds: [embed] });
            }
          }
        }

        for (const row of rows) {
          const { type, token, bot_id, owner, status, temps } = row;

          if (activeBots.has(bot_id)) {
            const existingBot = activeBots.get(bot_id);
            if (status === 'restart') {
              existingBot.stop();
              existingBot.run();
              const updateQuery = 'UPDATE Fiew SET status = "on" WHERE bot_id = ?';
              client.db.run(updateQuery, [bot_id], (err) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour du statut du bot :', err);
                }
              });
              const logChannel = client.channels.cache.get(logs.restart);
              if (logChannel) {
                const bot = await client.users.fetch(bot_id);
                const embed = new Discord.EmbedBuilder()
                  .setColor(client.config.color)
                  .setTitle('Redémarrage du système')
                  .setThumbnail(bot.displayAvatarURL())
                  .setDescription(`**Redémarrage de** [\`${bot.tag}\`](https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=8&scope=bot%20applications.commands)\n┖ **Id :** (\`${bot.id}\`)\n ┖ **Date :** <t:${timestamp}:R> / <t:${timestamp}:F>`)
                  .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
                logChannel.send({ embeds: [embed] });
              }
            } else if (status === 'off') {
              existingBot.stop();
              activeBots.delete(bot_id);
              activeBotTypes.splice(activeBotTypes.indexOf(existingBot.type), 1);
              const updateQuery = 'UPDATE Fiew SET status = "off" WHERE bot_id = ?';
              client.db.run(updateQuery, [bot_id], (err) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour du statut du bot :', err);
                }
              });
              const logChannel = client.channels.cache.get(logs.stop);
              if (logChannel) {
                const bot = await client.users.fetch(bot_id);
                const embed = new Discord.EmbedBuilder()
                  .setColor(client.config.color)
                  .setTitle('Déconnexion du système')
                  .setThumbnail(bot.displayAvatarURL())
                  .setDescription(`**Déconnexion de** [\`${bot.tag}\`](https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=8&scope=bot%20applications.commands)\n┖ **Id :** (\`${bot.id}\`)\n ┖ **Date :** <t:${timestamp}:R> / <t:${timestamp}:F>`)
                  .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
                logChannel.send({ embeds: [embed] });
              }
            }
            continue;
          }

          if (status === 'off') {
            continue;
          }

          let newBot;
          let botType;

          if (type === 'Fiew') {
            newBot = new Fiew(token, owner, bot_id);
            botType = 'Fiew Bot';
          } else {
            continue;
          }

          activeBots.set(bot_id, newBot);
          activeBotTypes.push(type);
          await newBot.run();
          const logChannel = client.channels.cache.get(logs.start);
          if (logChannel) {
            const bot = await client.users.fetch(bot_id);
            const embed = new Discord.EmbedBuilder()
              .setColor(client.config.color)
              .setTitle('Connexion au système')
              .setThumbnail(bot.displayAvatarURL())
              .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
              .setDescription(`**Connexion de** [\`${bot.tag}\`](https://discord.com/api/oauth2/authorize?client_id=${bot.id}&permissions=8&scope=bot%20applications.commands)\n┖ **Id :** (\`${bot.id}\`)\n ┖ **Date :** <t:${timestamp}:R> / <t:${timestamp}:F>`)
            logChannel.send({ embeds: [embed] });
          }
        }
      } catch (error) {
       
      }
    };

    startBots();
    setInterval(startBots, 1000);
  }, 2000);
};
