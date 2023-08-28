const Discord = require('discord.js');

module.exports = async (client, interaction) => {
  setTimeout(() => {
    setInterval(() => {
      const currentTime = Date.now();
      client.db.all('SELECT * FROM Fiew', (error, rows) => {
        if (error) {
          console.error('Erreur lors de la récupération des bots depuis la base de données :', error);
          return;
        }

        rows.forEach((row) => {
          const expirationDate = row.temps;

          if (currentTime < expirationDate) {
            client.db.run('UPDATE Fiew SET temps = ? WHERE bot_id = ?', [expirationDate, row.bot_id], (error) => {
              if (error) {
                console.error('Erreur lors de la mise à jour du temps dans la base de données :', error);
              }
            });
          } else {
            client.db.run('UPDATE Fiew SET status = ? WHERE bot_id = ?', ['off', row.bot_id], (error) => {
              if (error) {
                console.error('Erreur lors de la mise à jour du statut dans la base de données :', error);
              } else {
              }
            });
          }
        });
      });
    }, 1500);
  }, 1600);
};
