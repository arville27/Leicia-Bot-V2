import Command from '@core/Command';
import { bold, SlashCommandBuilder } from 'discord.js';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('server')
    .setDescription('Provides information about the server.'),
  execute: async (context, interaction) => {
    if (interaction.guild) {
      await interaction.reply(`This is server ${bold(interaction.guild.name)}`);
    } else {
      await interaction.reply('This is private chat');
    }
  },
});
