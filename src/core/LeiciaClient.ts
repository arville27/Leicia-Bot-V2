import { Client, ClientOptions, Collection, Events } from 'discord.js';
import Command from './Command';
import EventHandler from './EventHandler';
import Context from './Context';
import logger from '@utils/logger';
import config from '../utils/config';

export default class LeiciaClient extends Client {
  public commands: Collection<string, Command>;
  public context: Context;

  constructor(options: ClientOptions) {
    super(options);
    this.commands = new Collection();
    this.context = {
      client: this,
      logger: logger,
    } satisfies Context;
  }

  public setCommands(commands: Command[]) {
    this.commands = new Collection(commands.map((cmd) => [cmd.data.name, cmd]));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public registerEvents(events: EventHandler<any>[]) {
    // Register events
    events.forEach((event) => {
      if (event.once) {
        this.once(event.name, (...args) => event.run(this.context, ...args));
      } else {
        this.on(event.name, (...args) => event.run(this.context, ...args));
      }
    });
  }

  private async registerCommands(guildId: string) {
    const guild = this.guilds.cache.get(guildId);
    if (guild) {
      this.context.logger.info(`Registering commands to ${guild.name}`);
      guild.commands.set([...this.commands.values()].map((cmd) => cmd.data.toJSON()));
    } else {
      this.context.logger.warn(`Unable to register commands to ${guildId}`);
    }
  }

  public async start(token: string) {
    this.login(token);

    // When the client is ready, run this code (only once)
    this.once(Events.ClientReady, (client) => {
      this.context.logger.info(`Ready! Logged in as ${client.user.tag}`);
      config.DEV_GUILD_IDS.forEach((guildId) => this.registerCommands(guildId));
    });

    this.on(Events.Debug, (m) => this.context.logger.debug(m));
    this.on(Events.Warn, (m) => this.context.logger.warn(m));
    this.on(Events.Error, (m) => this.context.logger.error(m));
  }
}
