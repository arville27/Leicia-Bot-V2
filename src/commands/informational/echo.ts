import Command from '@core/Command';
import { SlashCommandBuilder } from 'discord.js';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('echo')
    .setDescription('Replies back with argument given')
    .addStringOption((option) =>
      option.setName('argument').setDescription('Argument').setRequired(true)
    ),
  execute: async (context, interaction) => {
    await interaction.reply(`Echo: ${interaction.options.get('argument', true).value}`);
  },
});
