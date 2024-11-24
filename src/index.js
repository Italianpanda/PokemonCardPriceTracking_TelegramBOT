import TelegramBot from 'node-telegram-bot-api';
import { config } from 'dotenv';
import { setupDatabase } from './database.js';
import { setupCommands } from './commands.js';
import { initPriceTracker } from './priceTracker.js';
import { initWarManager } from './warManager.js';

config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function init() {
  await setupDatabase();
  setupCommands(bot);
  initPriceTracker(bot);
  initWarManager(bot);
  
  console.log('Bot started successfully!');
}

init().catch(console.error);