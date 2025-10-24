export default {
	providerName: 'sample_provider',
	gameName: 'lines',
	gameID: '0_0_expwilds_3r',         // да съвпада с math/game id за този билд
	rtp: 0.97,

	// --- 3x3 ---
	numReels: 3,
	numRows: [3, 3, 3],

	betModes: {
		base: {
			cost: 1.0,
			feature: true,
			buyBonus: false,
			rtp: 0.97,
			max_win: 5000.0,
		},
		bonus: {
			cost: 100.0,
			feature: false,
			buyBonus: true,
			rtp: 0.97,
			max_win: 5000.0,
		},
	},

	// --- 5 класически линии за 3 рийла ---
	// индексите са 0=топ, 1=среда, 2=дъно
	paylines: {
		'1': [1,1,1], // средата
		'2': [0,0,0], // горен ред
		'3': [2,2,2], // долен ред
		'4': [0,1,2], // диагонал ↘
		'5': [2,1,0], // диагонал ↗
		'6': [0,1,0], // V
		'7': [2,1,2], // ∧
		'8': [1,0,1], // ^ с връх горе
		'9': [1,2,1], // V с връх долу
		'10': [0,2,0], // зиг-заг
	},


	// --- Paytables (само 3-of-a-kind; при нужда добави '2' за 2-of-a-kind) ---
	symbols: {
		H1: { paytable: [{ '3': 5 }] },
		H2: { paytable: [{ '3': 3 }] },
		H3: { paytable: [{ '3': 2 }] },
		H4: { paytable: [{ '3': 1 }] },

		L1: { paytable: [{ '3': 0.5 }] },
		L2: { paytable: [{ '3': 0.3 }] },
		L3: { paytable: [{ '3': 0.3 }] },
		L4: { paytable: [{ '3': 0.2 }] },
		L5: { paytable: [{ '3': 0.1 }] },

		// Wild/Scatter
		W: {
			paytable: [{ '3': 5 }],
			special_properties: ['wild', 'multiplier'], // ако нямаш мултиплайър – остави само 'wild'
		},
		S: {
			special_properties: ['scatter'],
			// ако имаш scatter плащания, добави: paytable: [{ '3': 2 }]
		},
	},

	// --- Padding reels за 3×3 (basegame + freegame) ---
	// Поддържай балансирана смес от high/low, Scatter и Wild.
	paddingReels: {
		basegame: [
			// Reel 1
			[
				{ name: 'L1' }, { name: 'H1' }, { name: 'L3' }, { name: 'L2' }, { name: 'H2' },
				{ name: 'L4' }, { name: 'L5' }, { name: 'H3' }, { name: 'S'  }, { name: 'L2' },
				{ name: 'H4' }, { name: 'W'  }, { name: 'L3' }, { name: 'L1' }, { name: 'H2' },
			],
			// Reel 2
			[
				{ name: 'L2' }, { name: 'H3' }, { name: 'L4' }, { name: 'L1' }, { name: 'H1' },
				{ name: 'L5' }, { name: 'H2' }, { name: 'L3' }, { name: 'S'  }, { name: 'L4' },
				{ name: 'H4' }, { name: 'L2' }, { name: 'W'  }, { name: 'L3' }, { name: 'H3' },
			],
			// Reel 3
			[
				{ name: 'L3' }, { name: 'H4' }, { name: 'L5' }, { name: 'L2' }, { name: 'H1' },
				{ name: 'L4' }, { name: 'H3' }, { name: 'L1' }, { name: 'S'  }, { name: 'L5' },
				{ name: 'H2' }, { name: 'L3' }, { name: 'W'  }, { name: 'L2' }, { name: 'H4' },
			],
		],

		// По-„богати“ рийл-ленти за безплатни завъртания (повече W/S/H)
		freegame: [
			// Reel 1
			[
				{ name: 'L1' }, { name: 'H1' }, { name: 'H2' }, { name: 'L2' }, { name: 'H3' },
				{ name: 'L4' }, { name: 'W'  }, { name: 'H4' }, { name: 'S'  }, { name: 'L3' },
				{ name: 'H2' }, { name: 'L5' }, { name: 'W'  }, { name: 'L2' }, { name: 'H3' },
			],
			// Reel 2
			[
				{ name: 'H1' }, { name: 'L3' }, { name: 'H2' }, { name: 'L4' }, { name: 'W'  },
				{ name: 'L2' }, { name: 'H3' }, { name: 'S'  }, { name: 'H4' }, { name: 'L1' },
				{ name: 'H2' }, { name: 'L5' }, { name: 'W'  }, { name: 'L3' }, { name: 'H1' },
			],
			// Reel 3
			[
				{ name: 'L2' }, { name: 'H3' }, { name: 'L5' }, { name: 'H1' }, { name: 'W'  },
				{ name: 'L4' }, { name: 'H4' }, { name: 'S'  }, { name: 'L3' }, { name: 'H2' },
				{ name: 'L1' }, { name: 'H3' }, { name: 'W'  }, { name: 'L2' }, { name: 'H4' },
			],
		],
	},
};
