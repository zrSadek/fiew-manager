const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const ms = require('ms');

module.exports = {
  name: 'manage',
  description: 'Permet de gérer vos bot',
  category: 'Membres',
  aliases: ["mng"],
  run: async (client, message, args) => {
    try {
      const userId = message.author.id;
      const selectQuery = 'SELECT * FROM Fiew WHERE owner = ?';
      client.db.all(selectQuery, [userId], async (err, rows) => {
        if (err) {
          console.error('Erreur lors de la récupération des bots personnels :', err);
          await message.reply("Une erreur s'est produite.");
          return;
        }
        if (rows.length === 0) {
          await message.reply("Vous n'avez aucun bot.");
          return;
        }
        const selectOptions = [];
        for (const bot of rows) {
          if (bot.type && bot.bot_id) {
            const user = await client.users.fetch(bot.bot_id.toString());
            const tag = user.tag;
            selectOptions.push({
              label: tag,
              value: bot.bot_id.toString()
            });
          }
        }
        const selectMenu = new StringSelectMenuBuilder()
          .setCustomId('botSelect')
          .setPlaceholder('Sélectionnez vot re bot')
          .addOptions(selectOptions);

        const row = new ActionRowBuilder().addComponents(selectMenu);

        const embed = new EmbedBuilder()
          .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
          .setColor(client.config.color)
        let description = '';
        for (let index = 0; index < rows.length; index++) {
          const botUser = await client.users.fetch(rows[index].bot_id);
          const botLink = `https://discord.com/api/oauth2/authorize?client_id=${rows[index].bot_id}&permissions=8&scope=bot%20applications.commands`;
          description += `${index + 1} - [\`${botUser ? botUser.tag : 'Bot introuvable'}\`](${botLink}) | expire <t:${Math.floor(rows[index].temps / 1000)}:R> ${client.fiew.crow} | ${rows[index].status === 'on' ? 'Allumé' : 'Éteint'}\n`;
        }

        embed.setDescription(description);


        const reply = await message.reply({ content: null, embeds: [embed], components: [row] });

        const collector = reply.createMessageComponentCollector({ filter: i => i.user.id === message.author.id, time: ms("2m") });
        let selectedBotId;
        collector.on('collect', async (interaction) => {
          if (interaction.customId === 'botSelect') {
            selectedBotId = interaction.values[0];

            const selectedBot = rows.find(bot => bot.bot_id.toString() === selectedBotId);
            if (selectedBot) {
              const { token, owner, bot_id, status } = selectedBot;
              const statusText = status === 'on' ? 'Allumé' : 'Éteint'
              const embed = new EmbedBuilder()
                .setColor(client.config.color)
                .setTitle('Informations du Bot')
                .setDescription(`**Bot ID:** \`${bot_id}\`\n**Owner:** <@${owner}>\n**Status:** \`${statusText}\``);
              const actionSelectMenu = new StringSelectMenuBuilder()
                .setCustomId('botActionSelect')
                .setPlaceholder('Sélectionnez une action')
                .addOptions([
                  { label: 'Allumer', value: 'start', emoji: client.fiew.starts },
                  { label: 'Arrêter', value: 'stop', emoji: client.fiew.stops },
                  { label: 'Redémarrer', value: 'restart', emoji: client.fiew.restarts },
                  { label: 'Retour', value: 'retour', emoji: client.fiew.home }

                ]);

              const actionRow = new ActionRowBuilder().addComponents(actionSelectMenu);


              await interaction.update({ embeds: [embed], components: [actionRow], content: null });
            } else {
              await interaction.update({ content: "Le bot sélectionné n'a pas été trouvé.", components: [selectMenu] });
            }
          } else if (interaction.customId === 'botActionSelect') {
            const action = interaction.values[0];

            if (action === 'restart') {
              const updateQuery = 'UPDATE Fiew SET status = "restart" WHERE bot_id = ?';
              client.db.run(updateQuery, [selectedBotId], (err) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour du statut du bot :', err);
                } else {
                  console.log('Statut du bot mis à jour avec succès.');
                  interaction.update({ embeds: [], components: [], content: "Bot redémarré." });
                }
              });
            } else if (action === 'retour') {
              const embed = new EmbedBuilder()
                .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
                .setColor(client.config.color)
              let description = '';
              for (let index = 0; index < rows.length; index++) {
                const botUser = await client.users.fetch(rows[index].bot_id);
                const botLink = `https://discord.com/api/oauth2/authorize?client_id=${rows[index].bot_id}&permissions=8&scope=bot%20applications.commands`;
                description += `${index + 1} - [\`${botUser ? botUser.tag : 'Bot introuvable'}\`](${botLink}) | expire <t:${Math.floor(rows[index].temps / 1000)}:R> ${client.fiew.crow} | ${rows[index].status === 'on' ? 'Allumé' : 'Éteint'}\n`;
              }

              embed.setDescription(description);

              const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('botSelect')
                .setPlaceholder('Sélectionnez votre bot')
                .addOptions(selectOptions);

              const row = new ActionRowBuilder().addComponents(selectMenu);
              interaction.update({ embeds: [embed], components: [row], content: null })
            } else if (action === 'stop') {
              const updateQuery = 'UPDATE Fiew SET status = "off" WHERE bot_id = ?';
              client.db.run(updateQuery, [selectedBotId], (err) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour du statut du bot :', err);
                } else {
                  console.log('Statut du bot mis à jour avec succès.');
                  interaction.update({ embeds: [], components: [], content: "Bot arrêter." });
                }
              });
            } else if (action === 'start') {
              const updateQuery = 'UPDATE Fiew SET status = "on" WHERE bot_id = ?';
              client.db.run(updateQuery, [selectedBotId], (err) => {
                if (err) {
                  console.error('Erreur lors de la mise à jour du statut du bot :', err);
                } else {
                  console.log('Statut du bot mis à jour avec succès.');
                  interaction.update({ embeds: [], components: [], content: "Bot allumé." });
                }
              });
            }
          }
        });

        collector.on('end', async (collected) => {
          const disabledSelectMenu = new StringSelectMenuBuilder()
            .setCustomId('botSelect')
            .setPlaceholder('Sélectionnez votre bot')
            .setDisabled(true)
            .addOptions(selectOptions);

          const disabledRow = new ActionRowBuilder().addComponents(disabledSelectMenu);


          await reply.edit({ content: 'Ce select menu a expiré.', components: [disabledRow] });
        });
      });
    } catch (error) {
      console.log(error);
      await message.reply("Une erreur s'est produite.");
    }
  }
}
