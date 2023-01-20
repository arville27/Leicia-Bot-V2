import Context from './Context';
import { Awaitable, ClientEvents } from 'discord.js';

export type EventHandlerOptions<EventType extends keyof ClientEvents> = {
  name: EventType;
  once: boolean;
  run: (client: Context, ...args: ClientEvents[EventType]) => Awaitable<void>;
};

export default class EventHandler<T extends keyof ClientEvents> {
  public name: EventHandlerOptions<T>['name'];
  public once: EventHandlerOptions<T>['once'];
  public run: EventHandlerOptions<T>['run'];

  constructor({ name, once, run }: EventHandlerOptions<T>) {
    this.name = name;
    this.once = once;
    this.run = run;
  }
}
