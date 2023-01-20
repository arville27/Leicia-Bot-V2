import pino from 'pino';

export default pino({
  transport: {
    target: 'pino-pretty',
    options: { translateTime: true, ignore: 'pid,hostname', hideObject: false },
  },
});
