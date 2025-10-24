import type { ButtonIcon } from '../types';

// единственото място, което модър пипа за иконите
export const ICON_TX: Partial<Record<ButtonIcon, string>> = {
	menu: 'menu_icon.png',
	menuExit: undefined,           // ако нямаш кадър – остава текст
	autoSpin: 'auto_play_icon.png',
	turbo: 'fast_play_icon.png',
	increase: 'bet_plus_icon.png',
	decrease: 'bet_minus_icon.png',
	soundOn: 'volume_icon.png',
	soundOff: 'volume_icon.png',
	payTable: undefined,
	info: undefined,
	settings: undefined,
};
