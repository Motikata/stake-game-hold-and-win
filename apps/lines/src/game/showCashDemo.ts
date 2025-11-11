import { bookEventHandlerMap } from './bookEventHandlerMap';
import type { BookEventOfType } from './typesBookEvent';
import config from "./config";
import {INITIAL_BOARD} from "./constants";

const padCol = (visible3: string[]) => ([
    { name: 'L2' },
    { name: visible3[0] },
    { name: visible3[1] },
    { name: visible3[2] },
    { name: 'L1' },
]);

// --- NEW: гарантираме paddingReels ---
function ensurePaddingReels() {
    const cfg: any = config as any;
    if (!cfg.paddingReels) cfg.paddingReels = {};
    // ползваме INITIAL_BOARD като прост падинг борд за dev
    if (!cfg.paddingReels.basegame) cfg.paddingReels.basegame = INITIAL_BOARD;
    if (!cfg.paddingReels.freegame) cfg.paddingReels.freegame = INITIAL_BOARD;
}

export async function showCashDemo(
    colsVisible3: [string[], string[], string[]] = [
        ['L2','CASH','L3'],
        ['H1','CASH','L4'],
        ['L5','CASH','H3'],
    ],
    gameType: 'basegame' | 'freegame' = 'basegame',
) {
    ensurePaddingReels();

    const board = [
        padCol(colsVisible3[0]),
        padCol(colsVisible3[1]),
        padCol(colsVisible3[2]),
    ];

    const revealEvent: BookEventOfType<'reveal'> = {
        type: 'reveal',
        board,
        gameType,
    } as any;

    // това ще извика enhancedBoard.spin({ revealEvent, paddingBoard: config.paddingReels[gameType] })
    await bookEventHandlerMap.reveal(revealEvent, { bookEvents: [] });

    const positions = [
        { reel: 0, row: 1 },
        { reel: 1, row: 1 },
        { reel: 2, row: 1 },
    ];

    const winInfoEvent: BookEventOfType<'winInfo'> = {
        type: 'winInfo',
        wins: [{
            positions,
            amount: 0,
            symbol: 'CASH',
            kind: 'ways',
            ways: 1,
            reelIndex: 0,
            rowIndex: 0,
        } as any],
    } as any;

    await bookEventHandlerMap.winInfo(winInfoEvent);
}
