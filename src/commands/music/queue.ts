import Command from '@core/Command';
import { Track } from '@core/music';
import {
  ActionRowBuilder,
  bold,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  inlineCode,
  SlashCommandBuilder,
} from 'discord.js';

export default new Command({
  data: new SlashCommandBuilder().setName('queue').setDescription('Show music queue'),
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

    const subscription = context.musicSubscriptions.get(interaction.guild.id);
    if (!subscription) {
      return interaction.followUp({ content: 'No subscription available' });
    }

    const generateTrackInfo = (no: number | null, track: Track) => {
      const number = `${no}`.padStart(2, '0');
      const title = `${track.title.slice(0, 30)}${track.title.length > 30 ? '...' : ''}`;
      const duration = track.metadata.durationInSec;
      const url = track.metadata.url;
      return no
        ? `${inlineCode(number)} [${title}](${url}) ${duration}`
        : `[${title}](${url}) ${duration}`;
    };

    const maxPage = Math.ceil(subscription.queue.length / 10);
    const trackInfo = [];
    for (let i = 0; i < maxPage; i++) {
      const startIdx = i * 10;
      const endIdx = (i + 1) * 10;
      trackInfo.push(
        subscription.queue
          .slice(startIdx, endIdx)
          .map((track, index) => generateTrackInfo(startIdx + index + 1, track))
          .join('\n')
      );
    }

    const { index, track } = subscription.getCurrentTrack();
    const currTrackInfo = track
      ? generateTrackInfo(null, track)
      : bold('**Currently not playing**');

    const pages = trackInfo.map((list) => {
      return new EmbedBuilder()
        .setColor('#93C5F7')
        .setTitle(`Music Queue (${subscription.queue.length} tracks)`)
        .addFields({
          name: track
            ? `Now Playing ${inlineCode(`(Track ${index + 1})`)}`
            : 'At the end of the queue',
          value: `${currTrackInfo}\n\n${list}`,
        });
    });

    // create an array of buttons
    const buttonList = [
      new ButtonBuilder()
        .setCustomId('PREV')
        .setLabel('Previous')
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId('NEXT')
        .setLabel('Next')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('caller')
        .setLabel(`Called by ${interaction.user.tag}`)
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true),
    ];

    await paginationEmbed(interaction, pages, buttonList);
  },
});

async function paginationEmbed(
  interaction: CommandInteraction,
  pages: EmbedBuilder[],
  buttonList: ButtonBuilder[],
  timeout = 60_000
) {
  if (!pages) throw new Error('Pages are not given.');
  if (!buttonList) throw new Error('Buttons are not given.');

  let page = 0;

  // has the interaction already been deferred? If not, defer the reply.
  if (!interaction.deferred) {
    await interaction.deferReply();
  }

  const row = new ActionRowBuilder<typeof buttonList[number]>().addComponents(buttonList);

  const curPage = await interaction.editReply({
    embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
    components: [row],
  });

  const collector = curPage.createMessageComponentCollector({
    filter: (i) => i.user === interaction.user,
    time: timeout,
  });

  collector.on('collect', async (i) => {
    switch (i.customId) {
      case 'PREV':
        page = page > 0 ? --page : pages.length - 1;
        break;
      case 'NEXT':
        page = page + 1 < pages.length ? ++page : 0;
        break;
    }

    await i.deferUpdate();
    await i.editReply({
      embeds: [pages[page].setFooter({ text: `Page ${page + 1} / ${pages.length}` })],
      components: [row],
    });

    collector.resetTimer();
  });

  collector.on('end', async () => {
    await curPage.delete();
  });

  return curPage;
}
