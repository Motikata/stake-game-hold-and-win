import _ from 'lodash';

import { recordBookEvent, checkIsMultipleRevealEvents, type BookEventHandlerMap } from 'utils-book';
import { stateBet, stateUi } from 'state-shared';
import { sequence } from 'utils-shared/sequence';

import { eventEmitter } from './eventEmitter';
import { playBookEvent } from './utils';
import { winLevelMap, type WinLevel, type WinLevelData } from './winLevelMap';
import { stateGame, stateGameDerived } from './stateGame.svelte';
import type { BookEvent, BookEventOfType, BookEventContext } from './typesBookEvent';
import type { Position } from './types';
import config from './config';

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

	// ако нищо валидно – приключваме веднага
	if (valid.length === 0) {
		console.log('[BOOK] 🚫 No valid positions, skipping symbol animation.');
		return;
	}

	// safety timeout да не увисва
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

export const bookEventHandlerMap: BookEventHandlerMap<BookEvent, BookEventContext> = {
	// ---- SPIN / REVEAL ------------------------------------------------------
	reveal: async (bookEvent: BookEventOfType<'reveal'>, { bookEvents }: BookEventContext) => {
		console.log('[BOOK] ▶️ reveal start', bookEvent);

		// ЛОГНИ борда като имена, за да видим източника на W
		try {
			const namesTable = bookEvent.board.map((col) => col.map((s) => s.name));
			console.group('[BOOK][REVEAL] incoming board names');
			console.table(namesTable);
			console.groupEnd();
		} catch (e) {
			console.warn('[BOOK][REVEAL] names log failed', e);
		}

		// НОРМАЛИЗАЦИЯ: в тази игра не ползваме W → заменяме с L1 (или смени с 'X', ако искаш празен)
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

		await stateGameDerived.enhancedBoard.spin({
			revealEvent: cleanedReveal,
			paddingBoard: config.paddingReels[cleanedReveal.gameType],
		});

		console.log('[BOOK] ✅ spin finished for reveal');
		eventEmitter.broadcast({ type: 'soundScatterCounterClear' });

		// Важно: приключи събитието reveal, за да продължи машината
		eventEmitter.broadcast({ type: 'endEvent', name: 'reveal' });
		console.log('[BOOK] 🔔 endEvent: reveal dispatched');
	},

	// ---- SIDE-EVENTS, КОИТО МОГАТ ДА БЛОКИРАТ ------------------------------
	// Някои рундове пращат newExpandingWilds – правим no-op handler и приключваме събитието.
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
		// Важно: приключи winInfo, за да дойде updateFreeSpin/next reveal
		eventEmitter.broadcast({ type: 'endEvent', name: 'winInfo' });
	},

	setTotalWin: async (bookEvent: BookEventOfType<'setTotalWin'>) => {
		console.log('[BOOK] 🧮 setTotalWin', bookEvent.amount);
		stateBet.winBookEventAmount = bookEvent.amount;
		// обикновено runner-ът не изисква endEvent тук, но няма да навреди:
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
			current: undefined,
			total: bookEvent.totalFs,
		});
		stateUi.freeSpinCounterTotal = bookEvent.totalFs;

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
			return _.findLast(bookEvents, (be) => be.type === type) as
				| BookEventOfType<T>
				| undefined;
		}

		const lastFreeSpinTriggerEvent = findLastBookEvent('freeSpinTrigger' as const);
		const lastUpdateFreeSpinEvent = findLastBookEvent('updateFreeSpin' as const);
		const lastSetTotalWinEvent = findLastBookEvent('setTotalWin' as const);
		const lastUpdateGlobalMultEvent = findLastBookEvent('updateGlobalMult' as const);

		if (lastFreeSpinTriggerEvent) await playBookEvent(lastFreeSpinTriggerEvent, { bookEvents });
		if (lastUpdateFreeSpinEvent) playBookEvent(lastUpdateFreeSpinEvent, { bookEvents });
		if (lastSetTotalWinEvent) playBookEvent(lastSetTotalWinEvent, { bookEvents });
		if (lastUpdateGlobalMultEvent) playBookEvent(lastUpdateGlobalMultEvent, { bookEvents });

		console.log('[BOOK] ✅ createBonusSnapshot done');
	},
};
