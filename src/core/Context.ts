import LeiciaClient from './LeiciaClient';
import loggerInstance from '@utils/logger';

class Context {
  constructor(public client: LeiciaClient, public logger: typeof loggerInstance) {
    return;
  }
}

export default Context;
