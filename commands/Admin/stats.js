const fs = require('fs');
const Discord = require('discord.js');
const now = new Date();
const config = require('../../config.json');
const timestamp = Math.floor(now.getTime() / 1000);

module.exports = {
    name: "stats",
    description: "Donne le nombre de bots",
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

        const botCount = await botall(client);
        const botenligne = await boton(client);
        const bothorligne = await bothotligne(client); 
        const clientss = await clients(client); 
        const embed = new Discord.EmbedBuilder()
            .setTitle('Stats Bot')
            .setColor(client.config.color)
            .setDescription(`┖ **Total :** \`${botCount} bots\`\n ┖ **En Ligne :** \`${botenligne} en ligne\` \n┖ **Hors Ligne :** \`${bothorligne} hors ligne\`\n┖ **Clients :** \`${clientss}\``)
            .setFooter({text: client.config.footer, iconURL: client.user.avatarURL()})

        return message.reply({ embeds: [embed] });
    }
};

async function botall(client) {
    const query = 'SELECT COUNT(*) AS count FROM Fiew WHERE bot_id IS NOT NULL';

    return new Promise((resolve, reject) => {
        client.db.get(query, (err, row) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
}



async function clients(client) {
    const query = 'SELECT COUNT(*) AS count FROM Fiew WHERE owner IS NOT NULL';

    return new Promise((resolve, reject) => {
        client.db.get(query, (err, row) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
}

async function boton(client) {
    const query = 'SELECT COUNT(*) AS count FROM Fiew WHERE bot_id IS NOT NULL AND status = "on"';

    return new Promise((resolve, reject) => {
        client.db.get(query, (err, row) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
}
async function bothotligne(client) {
    const query = 'SELECT COUNT(*) AS count FROM Fiew WHERE bot_id IS NOT NULL AND status = "off"';

    return new Promise((resolve, reject) => {
        client.db.get(query, (err, row) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(row.count);
            }
        });
    });
}