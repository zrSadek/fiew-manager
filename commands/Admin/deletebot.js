const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = {
  name: "deletebot",
  description: "Supprime un bot perso",
  usage: "deletebot <botId>",
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
    let msg = await message.reply(`${client.fiew.chargement} Merci de patienter`)
    const botId = args[0];
    if (!botId) {
      return msg.edit(`Utilisation incorrecte. Utilisez : \`${prefix}deletebot <botId>\``);
    }
    const botExists = await checkBotExists(client, botId);
    if (!botExists) { return msg.edit("Bot non trouvé dans la base de données !"); }

    try {

        const query = 'UPDATE Fiew SET status = ? WHERE bot_id = ?';
        const values = ['off', botId];
        client.db.run(query, values, (err) => {})
        client.db.run('DELETE FROM Fiew WHERE bot_id = ?', [botId]);
        const bot = await client.users.fetch(botId);
        const namebot = bot ? bot.tag : "Bot introuvable";

      return msg.edit(`Le bot \`${namebot}\` a été supprimé avec succès.`);
    } catch (error) {
      console.log(error);
      return  msg.edit("Une erreur s'est produite lors de la suppression du bot.");
    }
  }
};

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