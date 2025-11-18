// src/game/assets.ts
export default {
	loader: {
		type: 'spine',
		src: {
			atlas: new URL('../../assets/spines/loader/loader.atlas', import.meta.url).href,
			skeleton: new URL('../../assets/spines/loader/loader.json', import.meta.url).href,
			scale: 2,
		},
		preload: true,
	},
	pressToContinueText: {
		type: 'sprites',
		src: new URL('../../assets/sprites/pressToContinueText/MM_pressanywhere.json', import.meta.url).href,
		preload: true,
	},

	M:  { type: 'spine', src: { atlas: new URL('../../assets/spines/symbols2/symbols2.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/symbols2/M.json',  import.meta.url).href, scale: 2 } },
	S:  { type: 'spine', src: { atlas: new URL('../../assets/spines/symbols2/symbols2.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/symbols2/S.json',  import.meta.url).href, scale: 2 } },

	explosion: { type: 'spine', src: { atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/symbols3/explosion.json', import.meta.url).href, scale: 2 } },
	W:         { type: 'spine', src: { atlas: new URL('../../assets/spines/symbols3/symbols3.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/symbols3/W.json',         import.meta.url).href, scale: 2 } },

	payFrame:   { type: 'sprite',  src: new URL('../../assets/sprites/payFrame/payFrame.png',      import.meta.url).href },

	anticipation: { type: 'spine', src: { atlas: new URL('../../assets/spines/anticipation/anticipation.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/anticipation/anticipation.json', import.meta.url).href, scale: 2 } },

	goldFont:   { type: 'font', src: new URL('../../assets/fonts/goldFont/mm_gold.xml',          import.meta.url).href },
	goldBlur:   { type: 'font', src: new URL('../../assets/fonts/goldBlur/miningfont_gold_blur.xml', import.meta.url).href },
	silverFont: { type: 'font', src: new URL('../../assets/fonts/silverFont/mm_silver.xml',       import.meta.url).href },
	purpleFont: { type: 'font', src: new URL('../../assets/fonts/purpleFont/mm_purple.xml',       import.meta.url).href },
	prizeFont: { type: 'font', src: new URL('../../assets/fonts/prizeFont/prizeFont.xml',       import.meta.url).href },

	bigwin: { type: 'spine', src: { atlas: new URL('../../assets/spines/bigwin/big_wins.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/bigwin/mm_bigwin.json', import.meta.url).href, scale: 2 } },

	globalMultiplier: { type: 'spine', src: { atlas: new URL('../../assets/spines/globalMultiplier/multiframe.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/globalMultiplier/multiframe.json', import.meta.url).href, scale: 2 } },

	fsIntro:        { type: 'spine', src: { atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/fsIntro/fs_screen.json',         import.meta.url).href, scale: 2 } },
	fsIntroNumber:  { type: 'spine', src: { atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/fsIntro/fs_screen_number.json',  import.meta.url).href, scale: 2 } },
	fsOutroNumber:  { type: 'spine', src: { atlas: new URL('../../assets/spines/fsIntro/fs_screen.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/fsIntro/fs_total_number.json',  import.meta.url).href, scale: 2 } },

	foregroundAnimation:       { type: 'spine', src: { atlas: new URL('../../assets/spines/foregroundAnimation/mm_bg.atlas',        import.meta.url).href, skeleton: new URL('../../assets/spines/foregroundAnimation/mm_bg.json',        import.meta.url).href, scale: 2 }, preload: true },
	foregroundFeatureAnimation:{ type: 'spine', src: { atlas: new URL('../../assets/spines/foregroundFeatureAnimation/mm_bg_feature.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/foregroundFeatureAnimation/mm_bg_feature.json', import.meta.url).href, scale: 2 }, preload: true },

	tumble_multiplier: { type: 'spine', src: { atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/tumbleWin/tumble_multiplier.json', import.meta.url).href, scale: 2 } },
	tumble_win:        { type: 'spine', src: { atlas: new URL('../../assets/spines/tumbleWin/tumble_win.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/tumbleWin/tumble_win.json',        import.meta.url).href, scale: 2 } },

	reelhouse: { type: 'spine', src: { atlas: new URL('../../assets/spines/reelhouse/reelhouse_glow.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/reelhouse/reelhouse_glow.json', import.meta.url).href, scale: 2 } },

	progressBar: { type: 'sprites', src: new URL('../../assets/sprites/progressBar/progressBar.json', import.meta.url).href, preload: true },
	freeSpins:   { type: 'sprites', src: new URL('../../assets/sprites/freeSpins/freeSpins.json',     import.meta.url).href },
	winSmall:    { type: 'sprites', src: new URL('../../assets/sprites/winSmall/MM_Localisation_winsmall.json', import.meta.url).href },

	clusterWin: { type: 'spine', src: { atlas: new URL('../../assets/spines/clusterWin/clusterpay.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/clusterWin/clusterpay.json', import.meta.url).href, scale: 2 } },
	transition: { type: 'spine', src: { atlas: new URL('../../assets/spines/transition/transition.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/transition/transition.json', import.meta.url).href, scale: 2 } },

	coins:         { type: 'spriteSheet', src: new URL('../../assets/sprites/coin/SD2_Coin.json',             import.meta.url).href },

	sound: { type: 'audio', src: new URL('../../assets/audio/sounds.json', import.meta.url).href, preload: true },



	// ======================================================================
	// =========================  NEW SPRITESHEET ASSETS  ====================
	// ======================================================================

	// 1) UI sprite sheet (free-tex-packer output). JSON points to ui.png
	// Постави: assets/sprites/ui/ui.json + assets/sprites/ui/ui.png
	uiSheet: {
		type: 'sprites',
		src: new URL('../../assets/sprites/ui/ui.json', import.meta.url).href, // meta.image = "ui.png"
	},

	// 2) Symbols sprite sheet (free-tex-packer output). JSON points to symbols.png
	// Постави: assets/sprites/symbols/symbols.json + assets/sprites/symbols/symbols.png
	symbolsSheet: {
		type: 'sprites',
		src: new URL('../../assets/sprites/symbols/symbols.json', import.meta.url).href, // meta.image = "symbols.png"
	},

	// 3) Reels + frame sprite sheet — твоя общ sheet за рамка/ленти (JSON/PNG двойка)
	// Постави: assets/sprites/reelsAndFrame/reelsAndFrame.json + assets/sprites/reelsAndFrame/reelsAndFrame.png
	reelsAndFrameSheet: {
		type: 'sprites',
		src: new URL('../../assets/sprites/reelsAndFrame/reelsAndFrame.json', import.meta.url).href,
	},

	jackpotMeters: {
		type: 'sprites',
		src: new URL('../../assets/sprites/jackpotMeters/jackpotMeters.json', import.meta.url).href,
	},

    coin:  { type: 'spine', src: { atlas: new URL('../../assets/spines/coin/coin.atlas', import.meta.url).href, skeleton: new URL('../../assets/spines/coin/coin-pro.json',  import.meta.url).href, scale: 0.15 } },



    // ======================================================================
	// ======================================================================



} as const;
