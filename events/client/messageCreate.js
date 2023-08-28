const {  EmbedBuilder } = require("discord.js");
const config = require('../../config.json');
const logs = require('../../Fiew')
module.exports = async (client, message) => {
    try{
      if (!message.guild) return;
        if (message.author.bot) return;

        let prefix =  config.prefix; 
        

        if (message.content.match(new RegExp(`^<@!?${client.user.id}>( |)$`)) !== null) {
            return message.channel.send({ content : `Mon prefix sur ce serveur est : \`${prefix}\`` }) 
        }
    
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(prefix)})\\s*`);
        if (!prefixRegex.test(message.content)) return;
        const [, matchedPrefix] = message.content.match(prefixRegex);
        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

     
        let command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
        if (!command) return undefined
        if (command) command.run(client, message, args, prefix);
        console.log(`La commande ${commandName} a été utilisée par ${message.author.username} (${message.author.id}) dans le discord ${message.guild.name}`)
        client.channels.cache.get(logs.commande).send({embeds: [
            new EmbedBuilder()
            .setFooter({text: client.config.footer, iconURL: client.user.avatarURL()})
            .setColor(client.config.color)
            .setDescription(`La commande [\`${commandName}\`](https://discord.com/channels/${message.guild.id}/${message.channel.id}) a été utilisée par [\`${message.author.username}\`](https://discord.com/users/${message.author.id}) ([\`${message.author.id}\`](https://discord.com/users/${message.author.id})) dans [\`${message.channel.name}\`](https://discord.com/channels/${message.guild.id}/${message.channel.id})`)
        ]})
    }catch(e){
        console.log(e)
    }
}