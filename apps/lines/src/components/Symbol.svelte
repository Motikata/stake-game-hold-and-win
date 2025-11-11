<script lang="ts">
	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import { getSymbolInfo } from '../game/utils';
	import type { RawSymbol, SymbolState } from '../game/types';
	import { getContext } from '../game/context';
	import { BitmapText } from 'pixi-svelte';
	import { SYMBOL_SIZE } from '../game/constants';

	type Props = {
		x?: number;
		y?: number;
		state: SymbolState;
		rawSymbol: RawSymbol;
		oncomplete?: () => void;
		loop?: boolean;
	};

	const props: Props = $props();
	const context = getContext();
	const symbolInfo = $derived(getSymbolInfo({ rawSymbol: props.rawSymbol, state: props.state }));
	const isSprite = $derived(symbolInfo.type === 'sprite');

	// fallback Y за sprite (иначе props.y е undefined)
	const drawY = $derived(() => props.y ?? (isSprite ? 80 : 0));

	// --- CASH helpers --------------------------------------------------------

	function isCashPrizeSymbol(raw: any) {
		const n = (raw?.name || '').toUpperCase();
		const asset = (raw?.assetKey || '').toLowerCase();

		const cashLike = ['CASH', 'ACC', 'MINI', 'MINOR', 'MEGA', 'GRAND'];
		if (cashLike.includes(n)) return true;

		if (asset.includes('coin_cash_prize_symbol.png')) return true;
		if (asset.includes('accumulator_symbol.png')) return true;
		if (asset.includes('mini_prize_symbol.png')) return true;
		if (asset.includes('minor_prize_symbol.png')) return true;
		if (asset.includes('mega_prize_symbol.png')) return true;
		if (asset.includes('grand_prize_symbol.png')) return true;

		if (raw?.cash != null || raw?.amount != null || raw?.value != null || raw?.prize != null) return true;

		return false;
	}

	function getCashAmount(raw: any): number | null {
		if (raw == null) return null;
		const val =
				raw.amount ??
				raw.cash ??
				raw.value ??
				raw.prize ??
				raw.coins ??
				null;

		return typeof val === 'number' && isFinite(val) ? val : null;
	}

	function shouldShowCash(raw: any, state: string) {
		if (!isCashPrizeSymbol(raw)) return false;
		const amt = getCashAmount(raw);
		if (amt == null || amt <= 0) return false;
		return state !== 'spin';
	}

	function formatCash(n: number) {
		return Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
	}

	// позициониране – леко над центъра на символа
	const cashYOffset = $derived(() => drawY - SYMBOL_SIZE * 0.18);
</script>

{#if isSprite}
	<SymbolSprite {symbolInfo} x={props.x} y={80} oncomplete={props.oncomplete} />
{:else}
	<SymbolSpine
			loop={props.loop}
			{symbolInfo}
			x={props.x}
			y={props.y}
			showWinFrame={props.state === 'win' && !['S', 'M'].includes(props.rawSymbol.name)}
			listener={{
			complete: props.oncomplete,
			event: (_, event) => {
				if (event.data?.name === 'wildExplode') {
					context.eventEmitter?.broadcast({ type: 'soundOnce', name: 'sfx_wild_explode' });
				}
			},
		}}
	/>
{/if}

{#if shouldShowCash(props.rawSymbol, props.state)}
<BitmapText
		anchor={0.5}
		x={props.x ?? 0}
		y={80}
		text={formatCash(getCashAmount(props.rawSymbol) ?? 0)}
		style={{ fontFamily: 'prizeFont', fontSize: 80 }}
		tint={0xFFFFFF}
		dropShadow={true}
		dropShadowAlpha={0.8}
		dropShadowAngle={1.2}
		dropShadowBlur={0}
		dropShadowDistance={2}
		zIndex={250}
/>
{/if}
