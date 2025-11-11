import { Signal, SignalBinding } from "signals";
import {gameLogger} from "./GameLogger";

// Type definition for SignalServiceEvent
export type SignalServiceEvent = {
    target: any, // Target of the event
    data?: { [key: string]: any } // Optional data of the event
}

export class SignalService {
    private static _instance: SignalService; // Singleton instance

    private logEnabled: boolean = true; // Enable/disable logging

    private _signals: Record<string, any>; // Stores all signals

    // Access to the singleton instance
    static get(): SignalService {
        return SignalService._instance ? SignalService._instance : SignalService._instance = new SignalService();
    }

    // Private constructor for singleton pattern
    private constructor() {
        this._signals = {};
    }

    /**
     * Retrieves a signal, creates it if necessary.
     * @param name The name of the signal.
     * @returns The signal.
     */
    getSignal(name: string): Signal {
        if (!this._signals[name]) {
            this._signals[name] = new Signal();
        }
        return this._signals[name];
    }

    /**
     * Adds a listener to a signal.
     * @param name The name of the signal.
     * @param listener The listener function.
     * @param listenerContext The context of the listener.
     * @param priority The priority of the listener.
     * @param once Whether the listener should be called only once.
     * @returns The signal binding.
     */
    add(name: string, listener: (evt: SignalServiceEvent) => void, listenerContext?: any, priority?: number, once?: boolean): SignalBinding {
        return once ? this.getSignal(name).addOnce(listener, listenerContext, priority) : this.getSignal(name).add(listener, listenerContext, priority);
    }

    /**
     * Adds a listener that will be called only once.
     * @param name The name of the signal.
     * @param listener The listener function.
     * @param listenerContext The context of the listener.
     * @param priority The priority of the listener.
     * @returns The signal binding.
     */
    addOnce(name: string, listener: (evt: SignalServiceEvent) => void, listenerContext?: any, priority?: number): SignalBinding {
        return this.add(name, listener, listenerContext, priority, true);
    }

    /**
     * Removes a listener from a signal.
     * @param name The name of the signal.
     * @param listener The listener function.
     * @param context The context of the listener.
     * @returns The removed listener function.
     */
    remove(name: string, listener: (evt: SignalServiceEvent) => void, context?: any): Function {
        return this.getSignal(name).remove(listener, context);
    }

    /**
     * Dispatches a signal and optionally logs it.
     * @param name The name of the signal.
     * @param evt The event to be dispatched.
     * @param logEvent Whether the event should be logged.
     */
    dispatch(name: string, evt: SignalServiceEvent, logEvent: boolean = true) {
        if (logEvent && this.logEnabled) {
            gameLogger.info("%cSignalService:dispatch%c > %s, %o")('background: #fcba03; color: #2e2e2d;', '', name, evt);
        }
        let subName = name;
        let i = -1;
        while ((i = subName.lastIndexOf('|')) > 0) {
            subName = subName.substring(0, i);
            this.getSignal(subName).dispatch(evt);
        }

        this.getSignal(name).dispatch(evt);
    }

    /**
     * Waits for a signal and returns a promise.
     * @param name The name of the signal.
     * @returns A promise that resolves with the SignalServiceEvent.
     */
    resolve(name: string): Promise<SignalServiceEvent> {
        return new Promise(resolve => this.addOnce(name, resolve));
    }
}