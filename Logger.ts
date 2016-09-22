import winston = require('winston');
import config = require('config');
import fs = require('fs');

export namespace Logger {
    const env = process.env.NODE_ENV || 'development';
    const logDir = 'log'//config.get<string>('log.path');
    // Create the log directory if it does not exist
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }
    const tsFormat = () => (new Date()).toLocaleTimeString();
    export const log =new (winston.Logger)({
        transports: [
            // colorize the output to the console
            new (winston.transports.Console)({
                timestamp: tsFormat,
                colorize: true,
                level: 'info',
                handleExceptions: true
            }),
            new (require('winston-daily-rotate-file'))({
                filename: `${logDir}/-results.log`,
                timestamp: tsFormat,
                datePattern: 'yyyy-MM-dd',
                prepend: true,
                level: env === 'development' ? 'verbose' : 'info',
                handleExceptions: true
            })
        ],
        exceptionHandlers: [
            new (require('winston-daily-rotate-file'))({
                filename: `${logDir}/-exception.log`,
                timestamp: tsFormat,
                datePattern: 'yyyy-MM-dd',
                prepend: true,
                level: env === 'development' ? 'verbose' : 'info',
                handleExceptions: true,
                 humanReadableUnhandledException: true
            })
        ]
    });
}