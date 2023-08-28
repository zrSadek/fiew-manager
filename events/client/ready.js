const { EmbedBuilder } = require("discord.js")
const { ActivityType } = require("discord.js")
require('colors')
const ms = require("ms")
getNow = () => { return { time: new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris", hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }), }; };

module.exports = async (client, Bot, Client, bot, send) => {

  console.log("Bot".blue + " >>" + ` Connecté sur ${client.user.username}`.green)
  client.user.setPresence({ activities: [{ name: client.config.status, type: ActivityType.Streaming, url: "https://twitch.tv/oni145" }] })
  console.log("Commandes".blue + " >> " + `${client.commands.size}`.red + ` Chargés`.green)
}