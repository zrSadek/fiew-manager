const Discord = require('discord.js');

module.exports = {
  name: 'mybot',
  description: 'Affiche vos bots.',
  category: 'Membres',
  cooldown: 5,
  guildOnly: false,
  run: async (client, message) => {
    const userId = message.author.id;
    let msg = await message.reply({ content: 'Je recherche vos bots !' })
    const selectQuery = 'SELECT * FROM Fiew WHERE owner = ?';
    client.db.all(selectQuery, [userId], async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des bots personnels :', err);
        await msg.edit("Une erreur s'est produite.");
        return;
      }

      if (rows.length === 0) {
        await msg.edit("vous n'avez aucun bot.");
        return;
      }

      try {
        const embed = new Discord.EmbedBuilder()
          .setColor(client.config.color)
          .setFooter({ text: client.config.footer, iconURL: client.user.avatarURL() })
        let description = '';
        for (let index = 0; index < rows.length; index++) {
          const botUser = await client.users.fetch(rows[index].bot_id);
          const botLink = `https://discord.com/api/oauth2/authorize?client_id=${rows[index].bot_id}&permissions=8&scope=bot%20applications.commands`;
          description += `${index + 1} - [\`${botUser ? botUser.tag : 'Bot introuvable'}\`](${botLink}) | expire <t:${Math.floor(rows[index].temps / 1000)}:R> ${client.fiew.crow} | ${rows[index].status === 'on' ? 'Allumé' : 'Éteint'}\n`;
        }

        embed.setDescription(description);
        await msg.edit({ content: null, embeds: [embed] });
      } catch (error) {
        console.error(error);
        await msg.edit({ content: "Une erreur s'est produite." });
      }
    });
  },
};
