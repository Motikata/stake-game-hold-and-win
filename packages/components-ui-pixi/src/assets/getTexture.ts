import type { ButtonIcon } from '../types';
import { ICON_TX } from './icons.map';


export function iconTexture(icon?: string): string | undefined {
	if (!icon) return undefined;
	return ICON_TX[icon as keyof typeof ICON_TX];
}