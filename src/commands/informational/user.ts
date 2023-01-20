import Command from '@core/Command';
import { SlashCommandBuilder } from 'discord.js';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('user')
    .setDescription('Provides information about the user.'),
  execute: async (context, interaction) => {
    // interaction.user is the object representing the User who ran the command
    // interaction.member is the GuildMember object, which represents the user in the specific guild
    await interaction.reply(`This command was run by ${interaction.user.username}.`);
  },
});
