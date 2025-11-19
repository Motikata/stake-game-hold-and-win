import _ from 'lodash';

import {type BookEventHandlerMap, checkIsMultipleRevealEvents, recordBookEvent} from 'utils-book';
import {stateBet, stateUi} from 'state-shared';
import {sequence} from 'utils-shared/sequence';

import {eventEmitter} from './eventEmitter';
import {getSymbolX, getSymbolY, playBookEvent} from './utils';
import {type WinLevel, type WinLevelData, winLevelMap} from './winLevelMap';
import {stateGame, stateGameDerived} from './stateGame.svelte';
import type {BookEvent, BookEventContext, BookEventOfType} from './typesBookEvent';
import type {Position} from './types';
import config from './config';
import type {CashCoord, CashCoords} from './types/CashCoord';
import {SignalService} from "../signals/SignalService";

const winLevelSoundsPlay = ({ winLevelData }: { winLevelData: WinLevelData }) => {
	console.log('[BOOK] 🔊 play winLevelSounds', winLevelData);
	if (winLevelData?.alias === 'max') eventEmitter.broadcastAsync({ type: 'uiHide' });
	if (winLevelData?.sound?.sfx) {
		eventEmitter.broadcast({ type: 'soundOnce', name: winLevelData.sound.sfx });
	}
	if (winLevelData?.sound?.bgm) {
		eventEmitter.broadcast({ type: 'soundMusic', name: winLevelData.sound.bgm });
	}
	if (winLevelData?.type === 'big') {
		eventEmitter.broadcast({ type: 'soundLoop', name: 'sfx_bigwin_coinloop' });
	}
};

const winLevelSoundsStop = () => {
	console.log('[BOOK] 🛑 stop winLevelSounds');
	eventEmitter.broadcast({ type: 'soundStop', name: 'sfx_bigwin_coinloop' });
	if (stateBet.activeBetModeKey === 'SUPERSPIN' || stateGame.gameType === 'freegame') {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
	} else {
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_main' });
	}
	eventEmitter.broadcastAsync({ type: 'uiShow' });
};

const animateSymbols = async ({ positions }: { positions: Position[] }) => {
	console.log('[BOOK] ✨ animateSymbols', positions);
	eventEmitter.broadcast({ type: 'boardShow' });

	const ctx = stateGameDerived;
	const valid = positions.filter(
		(p) =>
			ctx.enhancedBoard?.board?.[p.reel] &&
			ctx.enhancedBoard.board[p.reel].reelState?.symbols?.[p.row],
	);

	if (valid.length !== positions.length) {
		console.warn('[BOOK] ⚠️ Some symbol positions invalid, skipping missing reels.');
	}

	if (valid.length === 0) {
		console.log('[BOOK] 🚫 No valid positions, skipping symbol animation.');
		return;
	}

	let timeoutHit = false;
	const timeout = new Promise<void>((resolve) =>
		setTimeout(() => {
			timeoutHit = true;
			console.warn('[BOOK] ⏱ animateSymbols timeout fallback triggered');
			resolve();
		}, 1200),
	);

	const animate = eventEmitter.broadcastAsync({
		type: 'boardWithAnimateSymbols',
		symbolPositions: valid,
	});

	await Promise.race([animate, timeout]);

	if (timeoutHit) {
		console.log('[BOOK] 🧩 Fallback resolved animation manually');
	}

	console.log('[BOOK] ✅ animateSymbols done (valid:', valid.length, ')');
};

function getDevMockConfig():
	| {
	enabled: boolean;
	symbol: string;
	positions?: { reel: number; row: number }[];
	amount?: number;
}
	| null {
	// работим само в DEV и в браузър
	if (!(import.meta.env?.DEV && typeof window !== 'undefined')) return null;

	const qs = new URLSearchParams(window.location.search);

	// enabled ако има поне един от mock* параметрите
	// и ако има 'mock', той да е truthy ('1','true','yes','cash')
	const hasAnyMockParam = ['mock', 'mockSymbol', 'mockPos', 'mockAmount'].some((k) => qs.has(k));
	const mockFlag = (qs.get('mock') || '').toLowerCase();
	const mockTruthy = mockFlag === '' || ['1', 'true', 'yes', 'cash'].includes(mockFlag);
	const enabled = hasAnyMockParam && (qs.has('mock') ? mockTruthy : true);

	if (!enabled) return null;

	// mock=1&mockSymbol=CASH&mockPos=0:1,1:2,2:1&mockAmount=750
	const parsePos = (s?: string) =>
		(s ?? '')
			.split(',')
			.map((p) => p.trim())
			.filter(Boolean)
			.map((p) => {
				const [r, y] = p.split(':').map(Number);
				return { reel: r, row: y };
			})
			.filter((x) => Number.isFinite(x.reel) && Number.isFinite(x.row));

	// helper за кръгли суми (по 50)
	const randStepInt = (min: number, max: number, step = 50) => {
		const steps = Math.floor((max - min) / step);
		return min + Math.floor(Math.random() * (steps + 1)) * step;
	};

	const symbol = qs.get('mockSymbol') ?? 'CASH';
	const positions = parsePos(qs.get('mockPos')) || undefined;

	const amountQS = qs.get('mockAmount');
	const amount = Number.isFinite(Number(amountQS)) ? Number(amountQS) : randStepInt(50, 5000, 50);

	return { enabled, symbol, positions, amount };
}

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	// ---- SPIN / REVEAL ------------------------------------------------------
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		console.log('[BOOK] ▶️ reveal start', bookEvent);

		try {
			const namesTable = bookEvent.board.map((col) => col.map((s) => s.name));
			console.group('[BOOK][REVEAL] incoming board names');
			console.table(namesTable);
			console.groupEnd();
		} catch (e) {
			console.warn('[BOOK][REVEAL] names log failed', e);
		}

		const normalizeName = (name: string) => (name === 'W' ? 'L1' : name);

		const cleanedBoard = bookEvent.board.map((col) =>
			col.map((sym) => ({ ...sym, name: normalizeName(sym.name) })),
		);

		const cleanedReveal: BookEventOfType<'reveal'> = {
			...bookEvent,
			board: cleanedBoard,
		};

		const isBonusGame = checkIsMultipleRevealEvents({ bookEvents });
		if (isBonusGame) {
			console.log('[BOOK] bonus mode detected');
			eventEmitter.broadcast({ type: 'stopButtonEnable' });
			recordBookEvent({ bookEvent });
		}

		stateGame.gameType = cleanedReveal.gameType;

		// ---------- DEV: mock преди spin() ----------
		const dev = getDevMockConfig();
		if (dev?.enabled) {
			const positions =
				dev.positions ??
				([
					{ reel: 0, row: 1 },
					{ reel: 1, row: 1 },
					{ reel: 2, row: 1 },
				] as { reel: number; row: number }[]);

			for (const { reel, row } of positions) {
				const col = cleanedReveal.board[reel];
				if (col?.[row]) {
					col[row] = {
						...col[row],
						name: dev.symbol,
						amount: dev.amount ?? (col[row] as any)?.amount ?? 0,
					};
				}
			}
			console.info('[DEV] mock BEFORE spin → symbols replaced to', dev.symbol, positions, 'amount=', dev.amount);
		}
		// -------------------------------------------

		// ---- SAFE PADDING FALLBACK ----------------
		const paddingBoard = (config as any)?.paddingReels?.[cleanedReveal.gameType] ?? cleanedReveal.board;

		await stateGameDerived.enhancedBoard.spin({
			revealEvent: cleanedReveal,
			paddingBoard,
		});

		try {
			if (dev?.enabled) {
				const mod = await import('./mockAfterSpin');
				// @ts-ignore
				const runMockAfterSpin = (mod as any).runMockAfterSpin ?? (mod as any).default;
				if (typeof runMockAfterSpin === 'function') {
					await runMockAfterSpin({
						symbol: dev.symbol,
						amount: dev.amount,
						positions:
							dev.positions ??
							([
								{ reel: 0, row: 1 },
								{ reel: 1, row: 1 },
								{ reel: 2, row: 1 },
							] as { reel: number; row: number }[]),
					});
				} else {
					console.warn('[DEV] mockAfterSpin missing exported function');
				}
			}
		} catch (e) {
			console.warn('[DEV] mockAfterSpin failed', e);
		}
		// -------------------------------------------

		// 👉 събираме всички CASH позиции
		const ctx = stateGameDerived;

		const cashByReel = ctx.enhancedBoard.board.map((r) => {
			const rows = r.reelState.symbols
				.map((s: { rawSymbol: { name: string } }, row: number) => (s.rawSymbol.name === 'CASH' ? row : -1))
				.filter((row: number) => row !== -1);
			return { reel: r.reelIndex, rows };
		});

		// координати за всеки CASH
		const cashCoordsByReel: CashCoords[] = cashByReel.map(({ reel, rows }) =>
			rows.map((row: number): CashCoord => ({
				reel,
				row,
				x: getSymbolX(reel),
				y: getSymbolY(row),
			})),
		);

		// ако има поне един CASH → колект към „слънцето“
		const hasAnyCash = cashCoordsByReel.some((arr) => arr.length > 0);
		if (hasAnyCash) {
			const cashCoordsFlat: CashCoord[] = cashCoordsByReel.flat();
			const to = { x: 0, y: 0 };
			SignalService.get().dispatch("fx:collectToSun", {
				target: this,
				data: {
					type: 'fx:collectToSun',
					items: cashCoordsFlat,
					toGlobal: to,
				}
			});

			console.log('[BOOK] → fx:collectToSun dispatch ', cashCoordsFlat);
		}

		console.log('[BOOK] ✅ spin finished for reveal');
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });

		// край на reveal
		eventEmitter.broadcast({ type: 'endEvent', name: 'reveal' });
		console.log('[BOOK] 🔔 endEvent: reveal dispatched');
	},

	// ---- SIDE-EVENTS --------------------------------------------------------
	newExpandingWilds: async (bookEvent: any) => {
		console.log('[BOOK] 🌱 newExpandingWilds (no-op)', bookEvent);
		eventEmitter.broadcast({ type: 'endEvent', name: 'newExpandingWilds' });
	},

	// ---- WINS ---------------------------------------------------------------
	winInfo: async (bookEvent: BookEventOfType<'winInfo'>) => {
		console.log('[BOOK] 💰 winInfo', bookEvent);
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_winlevel_small' });
		await sequence(bookEvent.wins, async (win) => {
			await animateSymbols({ positions: win.positions });
		});
		console.log('[BOOK] ✅ winInfo done');
		eventEmitter.broadcast({ type: 'endEvent', name: 'winInfo' });
	},

	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		console.log('[BOOK] 🧮 setTotalWin', bookEvent.amount);
		stateBet.winBookEventAmount = bookEvent.amount;
		eventEmitter.broadcast({ type: 'endEvent', name: 'setTotalWin' });
	},

	setWin: async (bookEvent: BookEventOfType<'setWin'>) => {
		console.log('[BOOK] 🏆 setWin', bookEvent.amount);
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];
		eventEmitter.broadcast({ type: 'winShow' });
		winLevelSoundsPlay({ winLevelData });
		await eventEmitter.broadcastAsync({
			type: 'winUpdate',
			amount: bookEvent.amount,
			winLevelData,
		});
		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'winHide' });
		console.log('[BOOK] ✅ setWin done');
		eventEmitter.broadcast({ type: 'endEvent', name: 'setWin' });
	},

	finalWin: async (bookEvent: BookEventOfType<'finalWin'>) => {
		console.log('[BOOK] 🏁 finalWin event reached', bookEvent);
		eventEmitter.broadcast({ type: 'endEvent', name: 'finalWin' });
		console.log('[BOOK] 🔔 endEvent: finalWin dispatched');
	},

	// ---- FREESPINS ----------------------------------------------------------
	freeSpinTrigger: async (bookEvent: BookEventOfType<'freeSpinTrigger'>) => {
		console.log('[BOOK] 🎰 freeSpinTrigger', bookEvent);
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_scatter_win_v2' });
		await animateSymbols({ positions: bookEvent.positions });

		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_superfreespin' });
		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		await eventEmitter.broadcastAsync({ type: 'transition' });

		eventEmitter.broadcast({ type: 'freeSpinIntroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'jng_intro_fs' });
		eventEmitter.broadcast({ type: 'soundMusic', name: 'bgm_freespin' });
		await eventEmitter.broadcastAsync({
			type: 'freeSpinIntroUpdate',
			totalFreeSpins: bookEvent.totalFs,
		});

		stateGame.gameType = 'freegame';
		eventEmitter.broadcast({ type: 'freeSpinIntroHide' });
		eventEmitter.broadcast({ type: 'boardFrameGlowShow' });

		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateUi.freeSpinCounterShow = true;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount + 1,
			total: bookEvent.total,
		});
		stateUi.freeSpinCounterTotal = bookEvent.total;

		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerButtonShow' });
		eventEmitter.broadcast({ type: 'drawerFold' });

		eventEmitter.broadcast({ type: 'endEvent', name: 'freeSpinTrigger' });
	},

	updateFreeSpin: async (bookEvent: BookEventOfType<'updateFreeSpin'>) => {
		console.log('[BOOK] 🔄 updateFreeSpin', bookEvent);
		eventEmitter.broadcast({ type: 'freeSpinCounterShow' });
		stateUi.freeSpinCounterShow = true;
		eventEmitter.broadcast({
			type: 'freeSpinCounterUpdate',
			current: bookEvent.amount + 1,
			total: bookEvent.total,
		});
		stateUi.freeSpinCounterTotal = bookEvent.total;
		eventEmitter.broadcast({ type: 'endEvent', name: 'updateFreeSpin' });
	},

	freeSpinEnd: async (bookEvent: BookEventOfType<'freeSpinEnd'>) => {
		const winLevelData = winLevelMap[bookEvent.winLevel as WinLevel];

		await eventEmitter.broadcastAsync({ type: 'uiHide' });
		stateGame.gameType = 'basegame';
		eventEmitter.broadcast({ type: 'boardFrameGlowHide' });

		eventEmitter.broadcast({ type: 'freeSpinOutroShow' });
		eventEmitter.broadcast({ type: 'soundOnce', name: 'sfx_youwon_panel' });
		winLevelSoundsPlay({ winLevelData });

		await eventEmitter.broadcastAsync({
			type: 'freeSpinOutroCountUp',
			amount: bookEvent.amount,
			winLevelData,
		});

		winLevelSoundsStop();
		eventEmitter.broadcast({ type: 'freeSpinOutroHide' });
		eventEmitter.broadcast({ type: 'freeSpinCounterHide' });
		stateUi.freeSpinCounterShow = false;

		await eventEmitter.broadcastAsync({ type: 'transition' });
		await eventEmitter.broadcastAsync({ type: 'uiShow' });
		await eventEmitter.broadcastAsync({ type: 'drawerUnfold' });
		eventEmitter.broadcast({ type: 'drawerButtonHide' });

		eventEmitter.broadcast({ type: 'endEvent', name: 'freeSpinEnd' });
	},

	// ---- SNAPSHOT -----------------------------------------------------------
	createBonusSnapshot: async (bookEvent: BookEventOfType<'createBonusSnapshot'>) => {
		console.log('[BOOK] 📸 createBonusSnapshot', bookEvent);
		const { bookEvents } = bookEvent;

		function findLastBookEvent<T>(type: T) {
			return _.findLast(bookEvents, (be) => be.type === type) as | BookEventOfType<T> | undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) await playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) await playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) await playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });

		console.log('[BOOK] ✅ createBonusSnapshot done');
	},
};
