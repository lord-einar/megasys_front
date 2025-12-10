/**
 * Logger utility for handling console outputs based on environment.
 * Logs are only displayed in development mode, except for errors which are always shown.
 */

const isDev = import.meta.env.DEV;

const logger = {
    log: (...args) => {
        if (isDev) {
            console.log(...args);
        }
    },
    warn: (...args) => {
        if (isDev) {
            console.warn(...args);
        }
    },
    error: (...args) => {
        // Errors are important enough to be shown in production too, 
        // but you might want to send them to a monitoring service like Sentry here.
        console.error(...args);
    },
    info: (...args) => {
        if (isDev) {
            console.info(...args);
        }
    },
    debug: (...args) => {
        if (isDev) {
            console.debug(...args);
        }
    }
};

export default logger;
