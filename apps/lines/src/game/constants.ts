import _ from 'lodash';
import type { RawSymbol, SymbolState } from './types';

export const SYMBOL_SIZE = 130;
export const SYMBOL_HIGHT = 180;
export const REEL_GAP = Math.round(SYMBOL_SIZE * 3); // пробвай 0.10–0.20 от SYMBOL_SIZE

export const REEL_PADDING = 0.53;

// initial board (padded top and bottom) — 3 reels × (3 видими + 2 padding)
export const INITIAL_BOARD: RawSymbol[][] = [
	[
		{ name: 'L2' }, // padding top
		{ name: 'L1' }, // visible row 1
		{ name: 'H2' }, // visible row 2
		{ name: 'L4' }, // visible row 3
		{ name: 'L1' }, // padding bottom
	],
	[
		{ name: 'H1' }, // padding top
		{ name: 'L5' },
		{ name: 'L2' },
		{ name: 'H3' },
		{ name: 'L4' }, // padding bottom
	],
	[
		{ name: 'L3' }, // padding top
		{ name: 'L5' },
		{ name: 'L3' },
		{ name: 'H4' },
		{ name: 'L4' }, // padding bottom
	],
];

export const BOARD_DIMENSIONS = { x: 3, y: 3 };

// (BOARD_SIZES, SYMBOL_SIZE и всичко останало може да остане както е)
export const BOARD_SIZES = {
	width: SYMBOL_SIZE * BOARD_DIMENSIONS.x,
	height: SYMBOL_SIZE * BOARD_DIMENSIONS.y,
};

export const BACKGROUND_RATIO = 2039 / 1000;
export const PORTRAIT_BACKGROUND_RATIO = 1242 / 2208;
const PORTRAIT_RATIO = 800 / 1422;
const LANDSCAPE_RATIO = 1600 / 900;
const DESKTOP_RATIO = 1422 / 800;

const DESKTOP_HEIGHT = 800;
const LANDSCAPE_HEIGHT = 900;
const PORTRAIT_HEIGHT = 1422;
export const DESKTOP_MAIN_SIZES = { width: DESKTOP_HEIGHT * DESKTOP_RATIO, height: DESKTOP_HEIGHT };
export const LANDSCAPE_MAIN_SIZES = {
	width: LANDSCAPE_HEIGHT * LANDSCAPE_RATIO,
	height: LANDSCAPE_HEIGHT,
};
export const PORTRAIT_MAIN_SIZES = {
	width: PORTRAIT_HEIGHT * PORTRAIT_RATIO,
	height: PORTRAIT_HEIGHT,
};

export const HIGH_SYMBOLS = ['H1', 'H2', 'H3', 'H4', 'H5'];

export const INITIAL_SYMBOL_STATE: SymbolState = 'static';

/*const HIGH_SYMBOL_SIZE = 0.9;
const LOW_SYMBOL_SIZE = 0.9;*/
const SPECIAL_SYMBOL_SIZE = 1;

export const REELSET_VISUAL = {
	frameScale: { w: 2.08, h: 1.00 },
	innerPadding: { side: 0.030, topBottom: 0.040 },
	divider: { widthRatio: 0.008, alpha: 0.9 },
	tag: { widthRatio: 0.12, heightRatio: 0.30, xOffsetRatio: 0.94, yOffsetRatio: 0.0, scale: 0.58 },
} as const;

const SPIN_OPTIONS_SHARED = {
	reelBounceBackSpeed: 0.15,
	reelSpinSpeedBeforeBounce: 4,
	reelPaddingMultiplierNormal: 1.2,
	reelPaddingMultiplierAnticipated: 10,
	reelSpinDelay: 145,
};

export const SPIN_OPTIONS_DEFAULT = {
	...SPIN_OPTIONS_SHARED,
	reelPreSpinSpeed: 2,
	reelSpinSpeed: 3,
	reelBounceSizeMulti: 0.3,
};

export const SPIN_OPTIONS_FAST = {
	...SPIN_OPTIONS_SHARED,
	reelPreSpinSpeed: 5,
	reelSpinSpeed: 5,
	reelBounceSizeMulti: 0.05,
};

export const MOTION_BLUR_VELOCITY = 31;

export const zIndexes = {
	background: {
		backdrop: -3,
		normal: -2,
		feature: -1,
	},
};

const explosion = {
	type: 'spine',
	assetKey: 'explosion',
	animationName: 'explosion',
	sizeRatios: { width: 1, height: 1 },
};

// --------------------------------------------------------------------
// NEW SPRITES (от symbols.png / symbols.json) — без Spine, само PNG от спрайт атласа
// Highs (съгласно арта): H1=Ankh, H2=Beetle, H3=Eagle, H4=Scroll, H5 (резерв) = Ankh
// 462x328 target => aspect = 462 / 328 ≈ 1.40854
const RATIO_W = 1.8058682122458438;
const RATIO_H = 1.4729757033000357;
// Highs
const h1Static = { type: 'sprite', assetKey: 'Ankh_symbol.png',   sizeRatios: { width: RATIO_W, height: RATIO_H} };
const h2Static = { type: 'sprite', assetKey: 'beetle_symbol.png', sizeRatios: { width: RATIO_W, height: RATIO_H } };
const h3Static = { type: 'sprite', assetKey: 'Eagle_symbol.png',  sizeRatios: { width: RATIO_W, height: RATIO_H } };
const h4Static = { type: 'sprite', assetKey: 'scroll_symbol.png', sizeRatios: { width: RATIO_W, height: RATIO_H } };
const h5Static = { type: 'sprite', assetKey: 'Ankh_symbol.png',   sizeRatios: { width: RATIO_W, height: RATIO_H } }; // резерв

// Lows (A/K/Q/J)
const l1Static = { type: 'sprite', assetKey: 'ace_symbol.png',    sizeRatios: { width: RATIO_W, height: RATIO_H } }; // L1 = A
const l2Static = { type: 'sprite', assetKey: 'king_symbol.png',   sizeRatios: { width: RATIO_W, height: RATIO_H } }; // L2 = K
const l3Static = { type: 'sprite', assetKey: 'queen_symbol.png',  sizeRatios: { width: RATIO_W, height: RATIO_H } }; // L3 = Q
const l4Static = { type: 'sprite', assetKey: 'jack_reelstrip.png',sizeRatios: { width: RATIO_W, height: RATIO_H } }; // L4 = J
const l5Static = { type: 'sprite', assetKey: 'jack_reelstrip.png',sizeRatios: { width: RATIO_W, height: RATIO_H } }; // L5 временно = J


// Scatter / Wild
const sStatic = { type: 'sprite', assetKey: 'scroll_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_H } };
// Ако искаш Wild от атласа, кажи кой PNG да използваме. Засега пазя стария w.png:
/*const wStatic = { type: 'sprite', assetKey: 'w.png',                   sizeRatios: { width: 1.12, height: 1.12 } };*/

//cash prize symbols
const coinCashStatic = { type: 'sprite', assetKey: 'coin_cash_prize_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_W } };
const accumulatorStatic = { type: 'sprite', assetKey: 'accumulator_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_H } };
const minorStatic = { type: 'sprite', assetKey: 'minor_prize_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_H } };
const miniStatic = { type: 'sprite', assetKey: 'mini_prize_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_H } };
const megaStatic = { type: 'sprite', assetKey: 'mega_prize_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_H } };
const grandStatic = { type: 'sprite', assetKey: 'grand_prize_symbol.png',       sizeRatios: { width: RATIO_W, height: RATIO_H } };



const wSizeRatios = { width: 1.5 * 0.9, height: SPECIAL_SYMBOL_SIZE * 1.15 };
const sSizeRatios = { width: 2.5, height: SPECIAL_SYMBOL_SIZE * 2.3 };
// --------------------------------------------------------------------

export const SYMBOL_INFO_MAP = {
	H1: {
		explosion,
		win: h1Static,
		postWinStatic: h1Static,
		static: h1Static,
		spin: h1Static,
		land: h1Static,
	},
	H2: {
		explosion,
		win: h2Static,
		postWinStatic: h2Static,
		static: h2Static,
		spin: h2Static,
		land: h2Static,
	},
	H3: {
		explosion,
		win: h3Static,
		postWinStatic: h3Static,
		static: h3Static,
		spin: h3Static,
		land: h3Static,
	},
	H4: {
		explosion,
		win: h4Static,
		postWinStatic: h4Static,
		static: h4Static,
		spin: h4Static,
		land: h4Static,
	},
	H5: {
		explosion,
		win: h5Static,
		postWinStatic: h5Static,
		static: h5Static,
		spin: h5Static,
		land: h5Static,
	},
	L1: {
		explosion,
		win: l1Static,
		postWinStatic: l1Static,
		static: l1Static,
		spin: l1Static,
		land: l1Static,
	},
	L2: {
		explosion,
		win: l2Static,
		postWinStatic: l2Static,
		static: l2Static,
		spin: l2Static,
		land: l2Static,
	},
	L3: {
		explosion,
		win: l3Static,
		postWinStatic: l3Static,
		static: l3Static,
		spin: l3Static,
		land: l3Static,
	},
	L4: {
		explosion,
		win: l4Static,
		postWinStatic: l4Static,
		static: l4Static,
		spin: l4Static,
		land: l4Static,
	},
	L5: {
		explosion,
		win: l5Static,
		postWinStatic: l5Static,
		static: l5Static,
		spin: l5Static,
		land: l5Static,
	},
	S: {
		explosion,
		postWinStatic: sStatic,
		static: sStatic,
		spin: sStatic,
		win: sStatic,
		land: sStatic,
	},
	X: {
		// за да не чупим типове/очаквания – даваме същия explosion обект,
		// но реално няма да се ползва, защото X не влиза в win/land логика
		explosion,
		win: l4Static,         // показваме J графика
		postWinStatic: l4Static,
		static: l4Static,
		spin: l4Static,
		land: l4Static,
	},
	CASH: {
		explosion,
		win: coinCashStatic,
		postWinStatic: coinCashStatic,
		static: coinCashStatic,
		spin: coinCashStatic,
		land: coinCashStatic,
	},
	ACC: {
		explosion,
		win: accumulatorStatic,
		postWinStatic: accumulatorStatic,
		static: accumulatorStatic,
		spin: accumulatorStatic,
		land: accumulatorStatic,
	},
	MINOR: {
		explosion,
		win: minorStatic,
		postWinStatic: minorStatic,
		static: minorStatic,
		spin: minorStatic,
		land: minorStatic,
	},
	MINI: {
		explosion,
		win: miniStatic,
		postWinStatic: miniStatic,
		static: miniStatic,
		spin: miniStatic,
		land: miniStatic,
	},
	MEGA: {
		explosion,
		win: megaStatic,
		postWinStatic: megaStatic,
		static: megaStatic,
		spin: megaStatic,
		land: megaStatic,
	},
	GRAND: {
		explosion,
		win: grandStatic,
		postWinStatic: grandStatic,
		static: grandStatic,
		spin: grandStatic,
		land: grandStatic,
	},

} as const;



//93611BF116
export const SCATTER_LAND_SOUND_MAP = {
	1: 'sfx_scatter_stop_1',
	2: 'sfx_scatter_stop_2',
	3: 'sfx_scatter_stop_3',
	4: 'sfx_scatter_stop_4',
	5: 'sfx_scatter_stop_5',
} as const;

export const UI_TX = {
	spinBg: 'spin_button_circle.png',
	spinIcon: 'spin_button_icon.png',
	auto: 'auto_play_icon.png',
	fast: 'fast_play_icon.png',
	betPlus: 'bet_plus_icon.png',
	betMinus: 'bet_minus_icon.png',
	menu: 'menu_icon.png',
	volume: 'volume_icon.png',
	// ...допълни, ако имаш още кадри
} as const;

// symbols textures (symbols.png)
export const SYMBOLS_TX = {
	mega: 'mega_prize_symbol.png',
	mini: 'mini_prize_symbol.png',
	minor: 'minor_prize_symbol.png',
	grand: 'grand_prize_symbol.png',
	accumulator: 'accumulator_symbol.png',     // мълнията/акумулатор
	coinCash: 'coin_cash_prize_symbol.png',

	ankh: 'Ankh_symbol.png',
	beetle: 'beetle_symbol.png',
	scroll: 'scroll_symbol.png',
	eagle: 'Eagle_symbol.png',

	A: 'ace_symbol.png',
	K: 'king_symbol.png',
	Q: 'queen_symbol.png',
	J: 'jack_reelstrip.png', // в атласа е така именуван
} as const;

export type SymbolTextureKey = keyof typeof SYMBOLS_TX;

// полезни групи
export const PRIZE_KEYS: SymbolTextureKey[] = ['mega','mini','minor','grand','accumulator','coinCash'];
export const PREMIUM_KEYS: SymbolTextureKey[] = ['ankh','beetle','scroll','eagle'];
export const LOW_KEYS: SymbolTextureKey[] = ['A','K','Q','J'];

// reels + frame textures (reelsAndFrame.png)
export const REELS_FRAME_TX = {
	frame3x3: '3x3_reels_frame.png',
	divider: 'reel_divider.png',
	baseStrip: 'base_reelstrip.png',
	tag27Ways: '27_ways_tag.png',
	holdwinBonusStrip: 'h&w_bonus_reelstrip.png',
} as const;

export type ReelsFrameKey = keyof typeof REELS_FRAME_TX;
