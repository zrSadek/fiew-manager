const fs = require('fs');
const Discord = require('discord.js');
const config = require('../../config.json');

module.exports = {
    name: "help",
    description: "Affiche les commande du bot",
    usage: "admincreate <token> <clé>",
    category: "Admin",
    userPerms: [],
    botPerms: [],
    cooldown: 0,
    guildOnly: false,
    maintenance: false,
    run: async (client, message, args) => {
        let color = client.config.color
        let footer = client.config.footer
        let prefix = client.config.prefix
        if (args.length === 0) {
            const commandFolders = fs.readdirSync('./commands');
            const selectMenuOptions = [];

            const emojiMap = {
                'Admin': '<:admin:1127930090320302090>',
                'Public': '<:members:1127933676265685072>'
            };

            for (const folder of commandFolders) {
                const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
                const options = [];

                for (const file of commandFiles) {
                    const command = require(`../${folder}/${file}`);
                    options.push({
                        label: command.name,
                        description: command.description || 'Aucune description pour le moment',
                        value: command.name
                    });
                }

                const emoji = emojiMap[folder] || '❌';

                selectMenuOptions.push({
                    label: folder,
                    value: folder,
                    emoji: emoji,
                    options: options
                });
            }

            const selectMenu = new Discord.StringSelectMenuBuilder()
                .setCustomId('help-select-menu' + message.id)
                .setPlaceholder('Choisir une catégorie')
                .addOptions(selectMenuOptions);

            const actionRow = new Discord.ActionRowBuilder()
                .addComponents(selectMenu);

            const embed = new Discord.EmbedBuilder()
                .setColor(color)
                .setDescription('Veuillez choisir une catégorie de commande ci-dessous.');

            await message.reply({ embeds: [embed], components: [actionRow] });

            client.on('interactionCreate', async interaction => {
                if (!interaction.isStringSelectMenu() || interaction.customId !== 'help-select-menu' + message.id) return;

                const [folder] = interaction.values;
                const commandFiles = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));

                const commandsList = commandFiles.map(file => {
                    const command = require(`../${folder}/${file}`);
                    return `\`${prefix}${command.name}\`\n┖ **Description :** \`${command.description || "Aucune description pour le moment"}\`\n┖ **Utilisation :** \`${command.usage ? prefix + command.usage : "Aucun Usage."}\``;}).join('\n');

                const emoji = emojiMap[folder] || '❌';

                const embed = new Discord.EmbedBuilder()
                    .setColor(color)
                    .setFooter({ text: footer, iconURL: client.user.avatarURL() })
                    .setTitle(`${emoji} ${folder}`)
                    .setDescription(commandsList);

                interaction.update({ embeds: [embed], components: [actionRow] });
            })

        } if (args.length !== 0) {
            const commandName = args[0].toLowerCase();
            const command = client.commands.get(commandName) || client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));
            if (!command) {
                return message.reply(`Cette commande n'existe pas. Utilisez \`${prefix}help\` pour voir la liste des commandes.`);
            }

            const embed = new Discord.EmbedBuilder()
            .setTitle(`Information de \`${command.name}\``)
            .setColor(color)
            .setFooter({text: client.config.footer, iconURL: client.user.avatarURL()})
            .setDescription(`\`${prefix}${command.name}\`
            ┖ **Description :** \`${command.description || "Aucune description pour le moment"}\`
            ┖ **Utilisation :** \`${command.usage ? prefix + command.usage : "Aucun Usage."}\`
            ┖ **Aliase :** \`${command.aliases ? command.aliases.join("` / `") : "Aucune aliase"}\``);
          return message.channel.send({ embeds: [embed] });
          
        }
    }
}