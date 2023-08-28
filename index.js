const { Client, GatewayIntentBits, Collection } = require('discord.js')
const { readdirSync } = require('fs')
const sqlite3 = require('sqlite3').verbose();
const Fiew = require('./Fiew')
require('colors')
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates, 
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessageTyping
    ],
})
let DATABASE = 'Fiew.db'
const db = new sqlite3.Database(DATABASE);

db.run(
  'CREATE TABLE IF NOT EXISTS Fiew (type TEXT, token TEXT, owner TEXT, bot_id TEXT, status TEXT, temps TEXT)',
  function (err) {
    if (err) {
      console.error(err);
    } else {
      console.log("Table".blue + " >> " + `Fiew`.red + ` bdd chargée avec succès`.green)
    }
  }
);

client.config = require("./config.json")
client.commands = new Collection()
client.aliases = new Collection()
client.db = db
client.fiew = Fiew
client.login(client.config.token || process.env.token)
const loadCommands = (dir = "./commands/") => {
    readdirSync(dir).forEach(dirs => {
      const commands = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
  
      for (const file of commands) {
        const getFileName = require(`${dir}/${dirs}/${file}`);
        client.commands.set(getFileName.name, getFileName);
     console.log("System".blue + " >> " + `commande `.green + `${getFileName.name}`.red+ ` chargé `.green)
  };
    });
  };
  const loadEvents = (dir = "./events/") => {
    readdirSync(dir).forEach(dirs => {
      const events = readdirSync(`${dir}/${dirs}/`).filter(files => files.endsWith(".js"));
  
      for (const event of events) {
        const evt = require(`${dir}/${dirs}/${event}`);
        const evtName = event.split(".")[0];
        client.on(evtName, evt.bind(null, client));
        console.log("System".blue + " >> " + `event `.green +  evtName.red + ` chargé`.green)
      };
    });
  };

loadEvents();
loadCommands();

/*
process.on("unhandledRejection", (reason, p) => {
  console.log(" [AntiCrash] :: Unhandled Rejection/Catch");
  console.log(reason, p);
});
process.on("uncaughtException", (err, origin) => {
  console.log(" [AntiCrash] :: Uncaught Exception/Catch");
  console.log(err, origin);
});
process.on("uncaughtExceptionMonitor", (err, origin) => {
  console.log(" [AntiCrash] :: Uncaught Exception/Catch (MONITOR)");
  console.log(err, origin);
});
process.on("multipleResolves", (type, promise, reason) => {
  console.log(" [AntiCrash] :: Multiple Resolves");
  console.log(type, promise, reason);
});
*/