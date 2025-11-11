import { writable } from 'svelte/store';

// Дефинирай минимална структура за да не дава грешки
type OverlaySymbolData = {
    reel: number;
    row: number;
    symbolId: string;
    customProp?: any;
}

// Store за символите
const _overlaySymbolStore = writable<OverlaySymbolData[]>([]);

export const overlaySymbolStore = {
    data: { subscribe: _overlaySymbolStore.subscribe },
    set: _overlaySymbolStore.set
};