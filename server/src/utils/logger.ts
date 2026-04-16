import { createLogger, format, transports, Logger } from 'winston';
const { combine, timestamp, json } = format;

const logger: Logger = createLogger({
  level: 'info',
  format: combine(
    timestamp(),
    json()
  ),
  transports: [
    new transports.Console()
  ],
});

export default logger;
