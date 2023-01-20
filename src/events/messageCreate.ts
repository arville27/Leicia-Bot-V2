import { Events } from 'discord.js';
import EventHandler from '@core/EventHandler';

export default new EventHandler({
  name: Events.MessageCreate,
  once: false,
  run: async (context, interaction) => {
    context.logger.info('Masuk', interaction);
    await interaction.reply('Hah');
  },
});
