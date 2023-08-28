module.exports = {
    name: "stop",
    description: "Stop un bot de force",
    usage: "stop <id>",
    category: "Admin",
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
        const botId = args[0];
        const botExists = await checkBotExists(client, botId);
        if (!botExists) { return message.reply("Bot non trouvé dans la base de données !"); }
        const query = 'UPDATE Fiew SET status = ? WHERE bot_id = ?';
        const values = ['off', botId];
        client.db.run(query, values, (err) => {
            if (err) {
                console.error(err);
                return message.reply("Une erreur s'est produite.");
            }
            return message.reply(`Le bot vient de se stopper de force.`)
        });


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