import Command from '@core/Command';
import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

export default new Command({
  data: new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!'),
  execute: async (context, interaction) => {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: `Pong!🏓 (${context.client.ws.ping} ms)`,
        iconURL: interaction.user.avatarURL() || interaction.user.defaultAvatarURL,
      })
      .setColor('Aqua');

    interaction.reply({
      embeds: [embed],
    });
  },
});
