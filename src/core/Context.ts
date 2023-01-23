import LeiciaClient from './LeiciaClient';
import loggerInstance from '@utils/logger';
import { MusicSubscription } from './music/MusicSubscription';
import { Collection, Snowflake } from 'discord.js';

class Context {
  constructor(
    public client: LeiciaClient,
    public logger: typeof loggerInstance,
    public musicSubscriptions: Collection<Snowflake, MusicSubscription>
  ) {
    return;
  }
}

export default Context;
