const pino = require('pino')

const logger = pino.transport({
    targets: [
        {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:dd-mm-yyyy HH:MM:ss',
                ignore: 'pid,hostname'
            }
        },
        {
            target: 'pino/file',
            options: {
                destination: `${__dirname}/logs/app.log`,
                ignore: 'pid,hostname',
                mkdir: true,
            }
        }
    ]
})

module.exports = pino(logger)