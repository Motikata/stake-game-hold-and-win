import _ from 'lodash';
import { stateBet } from 'state-shared';
import { createPlayBookUtils } from 'utils-book';
import { createGetEmptyPaddedBoard } from 'utils-slots';

import {
    SYMBOL_SIZE,
    REEL_PADDING, // оставям го – може да е нужен другаде
    SYMBOL_INFO_MAP,
    BOARD_DIMENSIONS,
    REEL_GAP,
    BOARD_SIZES,
} from './constants';
import { eventEmitter } from './eventEmitter';
import type { Bet, BookEventOfType } from './typesBookEvent';
import { bookEventHandlerMap } from './bookEventHandlerMap';
import type { RawSymbol, SymbolState } from './types';

// ⚠️ САМО TYPE IMPORT – няма runtime зависимост към pixi.js
import type { DisplayObject, Container } from 'pixi.js';

// Интерфейс за резултата: Обектът и неговото пълно име (за по-лесен дебъг)
interface NamedObject {
    name: string;
    object: DisplayObject;
}

/**
 * Рекурсивно обхожда PixiJS йерархията, започвайки от даден DisplayObject.
 * Връща масив от всички обекти, които имат зададено име (displayObject.name).
 *
 * @param root - Началният обхват на търсене (напр. app.stage или друг Container).
 * @param results - (Опционално) Акумулатор за резултатите.
 * @returns Масив от намерените обекти с техните имена.
 */
export function getNamedChildrenRecursive(
    root: DisplayObject,
    results: NamedObject[] = []
): NamedObject[] {
    // 1. Проверяваме дали текущият обект има име
    if (root.name) {
        results.push({
            name: root.name,
            object: root,
        });
    }

    // 2. Проверяваме дали обектът е контейнер (може да има деца)
    if ('children' in (root as any) && Array.isArray((root as any).children)) {
        // 3. Рекурсивно извикваме функцията за всяко дете
        for (const child of (root as any as Container).children) {
            getNamedChildrenRecursive(child as unknown as DisplayObject, results);
        }
    }

    return results;
}

/* ──────────────────────────────────────────────────────────────────────────
 * Play helpers
 * ────────────────────────────────────────────────────────────────────────── */
export const { getEmptyBoard } = createGetEmptyPaddedBoard({
    reelsDimensions: BOARD_DIMENSIONS,
});
export const { playBookEvent, playBookEvents } = createPlayBookUtils({
    bookEventHandlerMap,
});
export const playBet = async (bet: Bet) => {
    stateBet.winBookEventAmount = 0;
    await playBookEvents(bet.state);
    eventEmitter.broadcast({ type: 'stopButtonEnable' });
};

/* ──────────────────────────────────────────────────────────────────────────
 * Resume helpers
 * ────────────────────────────────────────────────────────────────────────── */
const BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT = [
    'updateGlobalMult',
    'freeSpinTrigger',
    'updateFreeSpin',
    'setTotalWin',
];

export const convertTorResumableBet = (lastBetData: Bet) => {
    const resumingIndex = Number(lastBetData.event);
    const bookEventsBeforeResume = lastBetData.state.filter(
        (_, eventIndex) => eventIndex < resumingIndex
    );
    const bookEventsAfterResume = lastBetData.state.filter(
        (_, eventIndex) => eventIndex >= resumingIndex
    );

    const bookEventToCreateSnapshot: BookEventOfType<'createBonusSnapshot'> = {
        index: 0,
        type: 'createBonusSnapshot',
        bookEvents: bookEventsBeforeResume.filter((bookEvent) =>
            BOOK_EVENT_TYPES_TO_RESERVE_FOR_SNAPSHOT.includes(bookEvent.type)
        ),
    };

    const stateToResume = [bookEventToCreateSnapshot, ...bookEventsAfterResume];

    return { ...lastBetData, state: stateToResume };
};

/* ──────────────────────────────────────────────────────────────────────────
 * Geometry
 * ────────────────────────────────────────────────────────────────────────── */

// X позиция на символа – смятаме реалната ширина на всяка колона,
// като вземем предвид разстоянието (REEL_GAP) и центрираме целия сет в рамката.
export const getSymbolX = (reelIndex: number): number => {
    const cols = BOARD_DIMENSIONS.x;
    const totalGap = REEL_GAP * (cols - 1);
    const symbolWidth = (BOARD_SIZES.width - totalGap) / cols;

    // центрираме групата от колони
    const totalUsed = cols * symbolWidth + totalGap;
    const left = (BOARD_SIZES.width - totalUsed) / 2;

    return left + symbolWidth / 2 + reelIndex * (symbolWidth + REEL_GAP);
};

export const getSymbolY = (symbolIndexOfBoard: number) =>
    (symbolIndexOfBoard + 0.5) * SYMBOL_SIZE;

/* ──────────────────────────────────────────────────────────────────────────
 * Symbol lookup (safe + debug)
 * ────────────────────────────────────────────────────────────────────────── */

const REPORTED_UNKNOWN = new Set<string>();
const REPORTED_MISSING_STATE = new Set<string>();

/**
 * Връща инфо за символа по name/state, без да допуска креш.
 * Логва еднократно проблемите и връща разумен fallback.
 */
export const getSymbolInfo = ({
                                  rawSymbol,
                                  state,
                              }: {
    rawSymbol: RawSymbol;
    state: SymbolState;
}) => {
    const key = rawSymbol?.name as keyof typeof SYMBOL_INFO_MAP | undefined;

    const info = key ? (SYMBOL_INFO_MAP as any)[key] : undefined;

    // 1) Непознато име или липсващо name
    if (!info) {
        const label = key ?? '(undefined)';
        if (!REPORTED_UNKNOWN.has(label)) {
            REPORTED_UNKNOWN.add(label);
            console.groupCollapsed(
                `%c[SYMBOL][UNKNOWN] key="${label}"`,
                'color:#fff;background:#d61f1f;padding:2px 6px;border-radius:3px'
            );
            console.log('rawSymbol =', rawSymbol);
            console.log('state =', state);
            console.log('known keys =', Object.keys(SYMBOL_INFO_MAP));
            console.trace();
            console.groupEnd();
        }

        // Fallback 1: някакъв „безвреден“ символ, ако съществува (например L1)
        if ((SYMBOL_INFO_MAP as any).L1?.static) {
            return (SYMBOL_INFO_MAP as any).L1.static;
        }
        // Fallback 2: първия наличен символ/състояние
        const firstKey = Object.keys(SYMBOL_INFO_MAP)[0] as keyof typeof SYMBOL_INFO_MAP;
        const firstInfo = (SYMBOL_INFO_MAP as any)[firstKey];
        return firstInfo.static ?? firstInfo.postWinStatic ?? Object.values(firstInfo)[0];
    }

    // 2) Познат символ, но липсва конкретният state
    const byState = info[state];
    if (!byState) {
        const tag = `${String(key)}:${state}`;
        if (!REPORTED_MISSING_STATE.has(tag)) {
            REPORTED_MISSING_STATE.add(tag);
            console.groupCollapsed(
                `%c[SYMBOL][MISSING_STATE] key="${String(key)}", state="${state}"`,
                'color:#111;background:#ffd166;padding:2px 6px;border-radius:3px'
            );
            console.log('rawSymbol =', rawSymbol);
            console.log('available states =', Object.keys(info));
            console.trace();
            console.groupEnd();
        }
        // Fallback по приоритет: static -> postWinStatic -> първото налично
        return info.static ?? info.postWinStatic ?? Object.values(info)[0];
    }

    // Всичко е наред
    return byState;
};

/* ──────────────────────────────────────────────────────────────────────────
 * PIXI Helpers
 * ────────────────────────────────────────────────────────────────────────── */

/**
 * Търси рекурсивно PIXI Container по име в дадения root.
 * Връща първия намерен Container.
 *
 * @param root - Началният DisplayObject (напр. app.stage).
 * @param name - Името на търсения контейнер.
 * @returns Намереният Container или null.
 */
export function findContainerByName(
    root: DisplayObject,
    name: string
): Container | null {
    // Използваме getNamedChildrenRecursive, за да съберем всички именувани обекти
    const allNamedObjects = getNamedChildrenRecursive(root);

    // Филтрираме и връщаме първия, който отговаря на името и „прилича“ на Container
    const found = allNamedObjects.find(
        (item) =>
            item.name === name &&
            'children' in (item.object as any) &&
            Array.isArray((item.object as any).children)
    );

    return found ? (found.object as Container) : null;
}
