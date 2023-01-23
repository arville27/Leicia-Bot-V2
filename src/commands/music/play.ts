import Command from '@core/Command';
import { MusicSubscription, Track } from '@core/music';
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import { GuildMember, SlashCommandBuilder } from 'discord.js';
import play from 'play-dl';

export default new Command({
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play music')
    .addStringOption((option) =>
      option
        .setName('query')
        .setDescription('Keyword for finding the song')
        .setRequired(true)
    ),
  execute: async (context, interaction) => {
    if (!interaction.deferred) await interaction.deferReply();

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

    // If a connection to the guild doesn't already exist and the user is in a voice channel, join that channel
    // and create a subscription.
    let subscription = context.musicSubscriptions.get(interaction.guild.id);
    if (!subscription) {
      const voiceConnection = joinVoiceChannel({
        channelId: interaction.member.voice.channel.id,
        guildId: interaction.guild.id,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      voiceConnection.on('error', console.warn);

      subscription = new MusicSubscription(voiceConnection);
      context.musicSubscriptions.set(interaction.guild.id, subscription);
    }

    // Make sure the connection is ready before processing the user's request
    try {
      await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
    } catch (error) {
      console.warn(error);
      await interaction.followUp(
        'Failed to join voice channel within 20 seconds, please try again later!'
      );
      return;
    }

    await interaction.followUp(`Query: ${interaction.options.get('query', true).value}`);
    const query = interaction.options.get('query', true).value as string;

    const searchResults = await play.search(query, {
      limit: 1,
    });

    try {
      // Attempt to create a Track from the user's video URL
      const track = await Track.from(searchResults[0], {
        onStart() {
          interaction
            .followUp({ content: 'Now playing!', ephemeral: true })
            .catch(console.warn);
        },
        onFinish() {
          interaction
            .followUp({ content: 'Now finished!', ephemeral: true })
            .catch(console.warn);
        },
        onError(error) {
          console.warn(error);
          interaction
            .followUp({ content: `Error: ${error.message}`, ephemeral: true })
            .catch(console.warn);
        },
      });
      // Enqueue the track and reply a success message to the user
      subscription.enqueue(track);
      await interaction.followUp(`Enqueued **${track.title}**`);
    } catch (error) {
      await interaction.followUp('Failed to play track, please try again later!');
    }
  },
});
