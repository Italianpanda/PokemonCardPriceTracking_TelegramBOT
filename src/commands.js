export function setupCommands(bot) {
  const commands = [
    { command: 'start', description: 'Avvia il bot' },
    { command: 'track', description: 'Traccia il prezzo di una carta' },
    { command: 'setprice', description: 'Mostra i prezzi dei set' },
    { command: 'createwar', description: 'Crea una nuova war (solo admin)' },
    { command: 'book', description: 'Prenota un posto in una war' }
  ];

  bot.setMyCommands(commands);

  bot.onText(/\/start/, async (msg) => {
    const welcomeMessage = `
Benvenuto nel Pokemon Card Tracker Bot!

Comandi disponibili:
/track [nome carta] - Controlla il prezzo di una carta
/setprice - Visualizza i prezzi dei set
/book [id war] [numero posto] - Prenota un posto in una war

Per gli amministratori:
/createwar [posti] [prezzo] [premio] - Crea una nuova war
`;
    
    await bot.sendMessage(msg.chat.id, welcomeMessage);
  });
}