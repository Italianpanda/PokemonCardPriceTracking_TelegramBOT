import { getDb } from './database.js';

export function initWarManager(bot) {
  // Create new war (admin only)
  bot.onText(/\/createwar (\d+) (\d+\.?\d*) (.+)/, async (msg, match) => {
    if (msg.from.id.toString() !== process.env.ADMIN_USER_ID) {
      return bot.sendMessage(msg.chat.id, 'Solo gli amministratori possono creare war.');
    }

    const spots = parseInt(match[1]);
    const price = parseFloat(match[2]);
    const prize = match[3];

    const db = getDb();
    await db.run(
      'INSERT INTO wars (total_spots, price_per_spot, prize) VALUES (?, ?, ?)',
      [spots, price, prize]
    );

    bot.sendMessage(msg.chat.id, 
      `War creata!\nPosti: ${spots}\nPrezzo per posto: €${price}\nPremio: ${prize}`);
  });

  // Book a spot
  bot.onText(/\/book (\d+) (\d+)/, async (msg, match) => {
    const warId = parseInt(match[1]);
    const spotNumber = parseInt(match[2]);

    const db = getDb();
    const war = await db.get('SELECT * FROM wars WHERE war_id = ?', [warId]);

    if (!war) {
      return bot.sendMessage(msg.chat.id, 'War non trovata.');
    }

    if (war.status !== 'open') {
      return bot.sendMessage(msg.chat.id, 'Questa war è già chiusa.');
    }

    if (spotNumber < 1 || spotNumber > war.total_spots) {
      return bot.sendMessage(msg.chat.id, 'Numero posto non valido.');
    }

    try {
      await db.run(
        'INSERT INTO war_spots (war_id, spot_number, user_id) VALUES (?, ?, ?)',
        [warId, spotNumber, msg.from.id]
      );

      bot.sendMessage(msg.chat.id, 
        `Posto ${spotNumber} prenotato per la war ${warId}! Attendi conferma per il pagamento.`);

      checkWarCompletion(bot, warId);
    } catch (error) {
      bot.sendMessage(msg.chat.id, 'Questo posto è già stato prenotato.');
    }
  });
}

async function checkWarCompletion(bot, warId) {
  const db = getDb();
  const war = await db.get('SELECT * FROM wars WHERE war_id = ?', [warId]);
  const spots = await db.all('SELECT * FROM war_spots WHERE war_id = ?', [warId]);

  if (spots.length === war.total_spots) {
    await db.run('UPDATE wars SET status = ? WHERE war_id = ?', ['pending_payment', warId]);

    const participants = await db.all(`
      SELECT users.user_id, war_spots.spot_number
      FROM war_spots
      JOIN users ON war_spots.user_id = users.user_id
      WHERE war_spots.war_id = ?
    `, [warId]);

    for (const participant of participants) {
      bot.sendMessage(participant.user_id,
        `La war ${warId} è completa! Per favore procedi con il pagamento di €${war.price_per_spot}`);
    }
  }
}