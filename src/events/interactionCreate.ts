import { Events } from 'discord.js';
import EventHandler from '@core/EventHandler';

export default new EventHandler({
  name: Events.InteractionCreate,
  once: false,
  run: async (context, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = context.client.commands.get(interaction.commandName);

    if (!command) {
      context.logger.error(`No command matching ${interaction.commandName} was found.`);
      return;
    }

    try {
      command.execute(context, interaction);
    } catch (error) {
      context.logger.error(error);
      await interaction.reply({
        content: 'There was an error while executing this command!',
        ephemeral: true,
      });
    }
  },
});
