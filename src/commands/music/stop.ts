import Command from '@core/Command';
import { GuildMember, SlashCommandBuilder } from 'discord.js';

export default new Command({
  data: new SlashCommandBuilder().setName('stop').setDescription('Stop music'),
  execute: async (context, interaction) => {
    await interaction.deferReply();

    if (
      !interaction.guild ||
      !interaction.member ||
      !(interaction.member instanceof GuildMember)
    ) {
      return interaction.followUp({
        content: 'Not in guild',
      });
    }

    // check if user in voice channel
    if (!interaction.member.voice.channel) {
      return await interaction.followUp({
        content: 'Please join a voice channel first!',
      });
    }

    const subscription = context.musicSubscriptions.get(interaction.guild.id);
    if (!subscription) {
      return interaction.followUp({ content: 'No subscription available' });
    }

    subscription.voiceConnection.destroy();
    context.musicSubscriptions.delete(interaction.guild.id);
    interaction.followUp({ content: 'Disconnected' });
  },
});
