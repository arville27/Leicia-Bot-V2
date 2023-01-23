import config from '@utils/config';
import { GatewayIntentBits } from 'discord.js';
import commands from '@commands';
import events from '@events';
import LeiciaClient from '@core/LeiciaClient';

const leiciaClient = new LeiciaClient({
  options: { intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates] },
});

leiciaClient.setCommands(commands);
leiciaClient.registerEvents(events);

leiciaClient.start(config.TOKEN);
