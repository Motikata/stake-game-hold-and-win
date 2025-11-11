/**
 *  By performing the check below, you can preventing an unnecessary call to a very expensive method.
 *  if (logger.isEnabled(Level.INFO))
 *      logger.info(String.format("The result is %d.", superExpensiveMethod()));
 */

/**
 * Interface for Logger
 */
export interface ILogger 
{
    minLogLevel: LogLevel;
    fatal(format: String|any, ...args: any[]): Function;
    error(format: String|any, ...args: any[]): Function;
    warn(format: String|any, ...args: any[]): Function;
    info(format: String|any, ...args: any[]): Function;
    debug(format: String|any, ...args: any[]): Function;
    trace(format: String|any, ...args: any[]): Function;
}

/**
 * Enum for Log Levels
 */
export enum LogLevel
{
    OFF	= 0,	    // No logging
    FATAL =	100,	// The application is unusable. Action needs to be taken immediately.
    ERROR =	200,	// An error occurred in the application.
    WARN =	300,	// Something unexpected—though not necessarily an error—happened and needs to be watched.
    INFO =	400,	// A normal, expected, relevant event happened.
    DEBUG =	500,	// Used for debugging purposes
    TRACE =	600	    // Used for debugging purposes—includes the most detailed information
}

/**
 * Type for Log Level Colors
 */
export type LogLevelColors = 
{
    [key:number]: string
}

/**
 * Factory class for creating loggers
 */
export class LoggerFactory 
{
    private static _instance: LoggerFactory;
    
    public static ENABLED: boolean = true; // process.env.NODE_ENV == 'development';

    private static _loggerList: {[index:string]:Logger} = {};

    private static _default = {
        minLogLevel: LogLevel.OFF,
        fatal: (f:any, ...args: any[]):Function=>{return ()=>{}},
        error: (f:any, ...args: any[]):Function=>{return ()=>{}},
        warn: (f:any, ...args: any[]):Function=>{return ()=>{}},
        info: (f:any, ...args: any[]):Function=>{return ()=>{}},
        debug: (f:any, ...args: any[]):Function=>{return ()=>{}},
        trace: (f:any, ...args: any[]):Function=>{return ()=>{}},
        isEnabled: (l:LogLevel): boolean=>{return false;}
    }

    /**
     * Get the singleton instance of LoggerFactory
     */
    static get(): LoggerFactory
    {
        if (!LoggerFactory._instance)
        {
            LoggerFactory._instance = new LoggerFactory();
        }

        return LoggerFactory._instance;
    }

    private constructor() 
    {
    }

    /**
     * Get a single logger function
     */
    public getSingleLogger(label: string, color: string, fn: Function, logLevel: LogLevel, logLevelColors: LogLevelColors, logger: Logger) 
    {
        return (...args1: any[]) => {

            if (logLevel > logger.minLogLevel || logger.minLogLevel == LogLevel.OFF || !LoggerFactory.ENABLED) 
            {
                return logger.off;
            }

            const log = args1.slice(1);
            let params: any;

            if (label == "")
                params = [fn, args1[0]];
            else
                params = [fn, `%c[ ${label} | %c${LogLevel[logLevel]}%c | ${this.getTime()} ]%c ` + args1[0], this.getColorStyleLeft(color), this.getColorStyleMiddle(logLevel, logLevelColors, color), this.getColorStyleRight(color), ""];
            
            params = params.concat(log);
            return Function.prototype.bind.apply(fn, params);
        };
    }

    /**
     * Get the left color style for the log message
     */
    public getColorStyleLeft(color: string) 
    {
        if (color == "")
            return `color: black; background-color: white; padding: 2px 6px; border: 1px solid black; border-top-left-radius: 5px; border-bottom-left-radius: 5px; font-size: 10px; font-weight: bold;`;
        else
            return `color: white; background-color: ${color}; padding: 2px 6px; border-top-left-radius: 5px; border-bottom-left-radius: 5px; font-size: 10px; border: 1px solid ${color}; font-weight: bold;`;
    }

    /**
     * Get the right color style for the log message
     */
    public getColorStyleRight(color: string) 
    {
        if (color == "")
            return `color: black; background-color: white; padding: 2px 6px; border: 1px solid black; border-top-right-radius: 5px; border-bottom-right-radius: 5px; font-size: 10px;`;
        else
            return `color: white; background-color: ${color}; padding: 2px 6px; border-top-right-radius: 5px; border-bottom-right-radius: 5px; font-size: 10px; border: 1px solid ${color};`;
    }

    /**
     * Get the middle color style for the log message
     */
    public getColorStyleMiddle(logLevel: LogLevel, logLevelColors: LogLevelColors, color: string) 
    {
        if (color == "")
        {
            color = 'black';
        }

        const lvc = logLevelColors[logLevel];
        return `${lvc} padding: 2px 6px; font-size: 10px; border: 1px solid ${color}; font-weight: bold;`;
    }

    /**
     * Get a logger instance
     */
    public getLogger(label: string = "", color: string = "", logLevel: LogLevel = LogLevel.ERROR, logLevelColors?: LogLevelColors): Logger 
    {
        if (!LoggerFactory.ENABLED)
        {
            return LoggerFactory._default as Logger;
        }

        if (label == "")
        {
            return this.createLogger(label, color, logLevel, logLevelColors);
        }
        else if (LoggerFactory._loggerList[label] != undefined)
        {
            return LoggerFactory._loggerList[label];
        }
        else
        {
            const log: Logger = this.createLogger(label, color, logLevel, logLevelColors);
            LoggerFactory._loggerList[label] = log;
            return log;
        }
    }

    /**
     * Remove a logger instance
     */
    public removeLogger(label: string): void
    {
        delete LoggerFactory._loggerList[label];
    }
 
    /**
     * Create a logger instance
     */
    private createLogger(label: string, color: string, minLogLevel: LogLevel, logLevelColors?: LogLevelColors): Logger
    {
        const logObj = new Logger(minLogLevel);

        if (logLevelColors === undefined)
        {
            logLevelColors = {};
            logLevelColors[LogLevel.OFF] = "background: #272822; color: #000000;";
            logLevelColors[LogLevel.FATAL] = "background: #ff0000; color: #ffffff;";
            logLevelColors[LogLevel.ERROR] = "background: #272822; color: #ff1b1b;";
            logLevelColors[LogLevel.WARN] = "background: #272822; color: #e2e22d;";
            logLevelColors[LogLevel.INFO] = "background: #272822; color: #72f93e;";
            logLevelColors[LogLevel.DEBUG] = "background: #272822; color: #66d9e2;";
            logLevelColors[LogLevel.TRACE] = "background: #272822; color: #bfbfbf;";
        }

        logObj.fatal = this.getSingleLogger(label, color, console.error, LogLevel.FATAL, logLevelColors, logObj),
        logObj.error = this.getSingleLogger(label, color, console.error, LogLevel.ERROR, logLevelColors, logObj),
        logObj.warn = this.getSingleLogger(label, color, console.warn, LogLevel.WARN, logLevelColors, logObj),
        logObj.info = this.getSingleLogger(label, color, console.info, LogLevel.INFO, logLevelColors, logObj),
        logObj.debug = this.getSingleLogger(label, color, console.log, LogLevel.DEBUG, logLevelColors, logObj),
        logObj.trace = this.getSingleLogger(label, color, console.log, LogLevel.TRACE, logLevelColors, logObj) 

        return logObj;
    }
 
    /**
     * Get the current time as a string
     */
    private getTime(): string
    {
        const date = new Date;
        const hour = date.getHours();
        const minutes = (date.getMinutes() < 10 ?'0':'') + date.getMinutes();
        const seconds =  (date.getSeconds() < 10 ?'0':'') + date.getSeconds()
        return `${hour}:${minutes}:${seconds}`;
    }
}
 
/**
 * Logger class implementation
 */
export class Logger implements ILogger
{
    minLogLevel: LogLevel;
          
    constructor(minLogLevel: LogLevel)
    {
        this.minLogLevel = minLogLevel;
    }

    fatal(format: String|any, ...args: any[]): Function {
        throw new Error("Method not implemented.");
    }

    error(format: String|any, ...args: any[]): Function {
        throw new Error("Method not implemented.");
    }

    warn(format: String|any, ...args: any[]): Function {
        throw new Error("Method not implemented.");
    }

    info(format: String|any, ...args: any[]): Function {
        throw new Error("Method not implemented.");
    }

    debug(format: String|any, ...args: any[]): Function {
        throw new Error("Method not implemented.");
    }

    trace(format: String|any, ...args: any[]): Function {
        throw new Error("Method not implemented.");
    }

    off()
    {
    }

    /**
     * Check if the log level is enabled
     */
    isEnabled(level: LogLevel): boolean
    {
        return level <= this.minLogLevel && this.minLogLevel != LogLevel.OFF && LoggerFactory.ENABLED;
    }
}
