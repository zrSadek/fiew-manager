const Discord = require('discord.js');
const ms = require('ms');

module.exports = {
  name: 'bot',
  description: 'Affiche les bots d\'un membre ou de vous.',
  category: 'Membres',
  cooldown: 5,
  guildOnly: false,
  run: async (client, message, args) => {
    let target;
    let searchMessage;

    if (message.mentions.members.first()) {
      target = message.mentions.members.first();
    } else if (args[0]) {
      try {
        target = await message.guild.members.fetch(args[0]);
      } catch (error) {
      }
    } else {
      target = message.member;
    }

    if (!target) return message.reply('\`❌\` Utilisateur non trouvée')
    const userId = target.id; 
    const selectQuery = 'SELECT * FROM Fiew WHERE owner = ?';
    client.db.all(selectQuery, [userId], async (err, rows) => {
      if (err) {
        console.error('Erreur lors de la récupération des bots personnels :', err);
        await message.reply("Une erreur s'est produite.");
        return;
      }

      if (rows.length === 0) {
        await message.reply("Aucun bot trouvée.");
        return;
      }

      try {
        const embed = new Discord.EmbedBuilder()
          .setColor(client.config.color)
         .setFooter({text: client.config.footer, iconURL: client.user.avatarURL()});

        let description = '';
        for (let index = 0; index < rows.length; index++) {
          const botUser = await client.users.fetch(rows[index].bot_id);
          const botLink = `https://discord.com/api/oauth2/authorize?client_id=${rows[index].bot_id}&permissions=8&scope=bot%20applications.commands`;
          description += `${index + 1} - [\`${botUser ? botUser.tag : 'Bot introuvable'}\`](${botLink}) | expire <t:${Math.floor(rows[index].temps / 1000)}:R> ${client.fiew.crow}\n`;
        }

        embed.setDescription(description);
        await message.reply({ content: null, embeds: [embed] });
      } catch (error) {
        console.error(error);
        await msg.edit({ content: "Une erreur s'est produite." });
      }
    });
  },
};