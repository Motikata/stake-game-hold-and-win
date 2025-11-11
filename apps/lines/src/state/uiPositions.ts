import { writable } from 'svelte/store';

type Point = { x: number; y: number };

export type UiPositions = {
    sunAbove: Point | null;
    boardCenter: Point | null;
};

const INIT: UiPositions = {
    sunAbove: null,
    boardCenter: null,
};

const base = writable<UiPositions>(INIT);
const { subscribe, set, update } = base;

/**
 * Експонираме:
 *  - subscribe / set / update (за съвместимост с текущия код)
 *  - reset(), setSunAbove(), setBoardCenter() — удобни helper-и
 */
export const uiPositions = {
    subscribe,
    set,
    update: (fn: (s: UiPositions) => UiPositions) => update(fn),

    reset: () => set(INIT),

    setSunAbove: (p: Point) =>
        update((s) => ({ ...s, sunAbove: p })),

    setBoardCenter: (p: Point) =>
        update((s) => ({ ...s, boardCenter: p })),
};
