import type { BookEventOfType } from './typesBookEvent';
import { bookEventHandlerMap } from './bookEventHandlerMap';

type Pos = { reel: number; row: number };
type MockOpts = {
    symbol?: string;
    positions?: Pos[];
    amount?: number;
};

/**
 * Пуска кратка post-spin демо анимация през winInfo.
 * По подразбиране: CASH на средния ред на 3-те рийла.
 * Заб.: amount тук е само за winInfo логиката; визуалният amount върху символа
 * идва от rawSymbol.amount, който вече инжектираме в reveal().
 */
export async function runMockAfterSpin(opts: MockOpts = {}) {
    const symbol = opts.symbol ?? 'CASH';
    const positions =
        opts.positions ?? [
            { reel: 0, row: 1 },
            { reel: 1, row: 1 },
            { reel: 2, row: 1 },
        ];

    const winInfoEvent: BookEventOfType<'winInfo'> = {
        type: 'winInfo',
        wins: [
            {
                positions,
                amount: opts.amount ?? 0,
                symbol,
                kind: 'ways',
                ways: 1,
                reelIndex: 0,
                rowIndex: 0,
            } as any,
        ],
    } as any;

    await bookEventHandlerMap.winInfo(winInfoEvent);
}
