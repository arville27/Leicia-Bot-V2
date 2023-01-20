import { SlashCommandBuilder, CommandInteraction } from 'discord.js';
import Context from './Context';

export interface CommandOptions {
  data:
    | SlashCommandBuilder
    | Omit<
        SlashCommandBuilder,
        'addSubcommand' | 'addSubcommandGroup' | '_sharedAddOptionMethod'
      >;
  execute: (context: Context, interaction: CommandInteraction) => void;
}

export default class Command {
  public data: CommandOptions['data'];
  public execute: CommandOptions['execute'];

  constructor({ data, execute }: CommandOptions) {
    this.data = data;
    this.execute = execute;
  }
}
