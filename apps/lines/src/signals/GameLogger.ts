import { LoggerFactory, LogLevel } from "./Logger";

/** Exports the gameLogger variable to use it anywhere. (Lazy call) */
export const gameLogger = LoggerFactory.get().getLogger("Game", "#2c8a19", process.env.NODE_ENV == "development" ? LogLevel.DEBUG : LogLevel.OFF);