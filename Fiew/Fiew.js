const Discord = require('discord.js');
const config_manager = require('../config.json');
const { GatewayIntentBits, Client, Collection } = require('discord.js');
const fs = require('fs');
const now = new Date();
const ms = require('ms');
const timestamp = Math.floor(now.getTime() / 1000);

class Fiew {
  constructor(token, owner, bot_id) {
    this.token = token;
    this.prefix = "+";
    this.botid = bot_id
    this.owner = owner;
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
      ],
    });
  }

  run() {
    return new Promise((resolve, reject) => {
      this.client.login(this.token)
        .then(() => {
          this.setupBot();
          resolve();
        })
        .catch((error) => {
          console.error(`[Token Invalide] Bot : ${this.botid} Owner ID: ${this.owner}`, error);
          reject(error);
        });
    });
  }
  

  stop() {
    if (this.client) {
      this.client.user.setStatus('invisible');
      this.client.destroy();
      console.log(`Le bot ${this.client.user.tag} vient de se stopper`);
    }
  }

  restart() {
    this.stop();
    this.run();
    this.setupBot();
  }

  setupBot() {
    this.client.on('ready', () => {
      this.client.user.setPresence({ activities: [{ name: config_manager.statuspersobot, type: 'STREAMING', url: 'https://twitch.tv/oni145' }] });
      console.log(`Bot ${this.client.user.tag} prêt !`);
    /*  this.client.users.fetch(this.owner).then((ownerUser) => {
        ownerUser.send({ embeds: [
          new Discord.EmbedBuilder()
            .setColor(config_manager.color)
            .setDescription(`Je me suis connecté au [\`${config_manager.footer}\`](${config_manager.support}) avec succès, pour voir mes commandes merci de faire \`${this.prefix}help\``)
            .setAuthor({name: this.client.user.username, iconURL: this.client.user.avatarURL()})
        ]})
      .catch((error) => {
        console.error(`Erreur lors de l'envoi du message au propriétaire : ${error}`);
      });
    });*/
  })
 
    this.client.on('messageCreate', async (message) => {
      if (message.author.id !== this.owner) return;

      if (message.content === `<@!${this.client.user.id}>` || message.content === `<@${this.client.user.id}>`) {
        message.reply(`Mon préfixe est : \`${this.prefix}\``);
      }
      
      if (message.content === `${this.prefix}ping`) {
        let ping = this.client.ws.ping;
        message.reply(`**Mon ping est :** \`${ping}ms\``);
      }
    });
  }

}


module.exports = Fiew;
