import logger from '@utils/logger';
import { exit } from 'process';

function verifyRequiredVariables() {
  const { TOKEN, NODE_ENV } = process.env;
  let DEV_GUILD_IDS: string[] = [];

  if (!TOKEN || TOKEN.length == 0) {
    logger.error('Please ensure "TOKEN" is defined as environment variable');
    exit(1);
  }

  if (!NODE_ENV || NODE_ENV === 'development') {
    const { DEVELOPMENT_GUILD_ID } = process.env;
    if (!DEVELOPMENT_GUILD_ID || DEVELOPMENT_GUILD_ID.length === 0) {
      logger.error(
        'Please ensure "DEVELOPMENT_GUILD_ID" is defined as environment variable'
      );
      exit(1);
    }

    DEV_GUILD_IDS = DEVELOPMENT_GUILD_ID?.split(/\s*,\s*/);
  }

  return { TOKEN, DEV_GUILD_IDS };
}

export default { ...verifyRequiredVariables() };
