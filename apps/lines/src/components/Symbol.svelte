<script lang="ts">
	import SymbolSpine from './SymbolSpine.svelte';
	import SymbolSprite from './SymbolSprite.svelte';
	import {getSymbolInfo} from '../game/utils';
	import type {RawSymbol, SymbolState} from '../game/types';
	import {getContext} from '../game/context';
	import {BitmapText} from 'pixi-svelte';

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

	function isHoldAndWinSymbol(raw: any) {
		// адаптирай към вашите ключове/флагове:
		// напр. raw.type === 'coin' || raw.assetKey === 'coin_cash_prize_symbol.png' || raw.name === 'L5'
		return raw?.type === 'coin' || raw?.wild === true && raw?.multiplier;
	}

	function shouldShowMultiplier(raw: any, state: string) {
		if (!raw?.multiplier || raw.multiplier <= 0) return false;
		if (!isHoldAndWinSymbol(raw)) return false;
		// скрий по време на spin (ако пречи), иначе покажи винаги
		return state !== 'spin';
	}

	function formatMultiplier(m: number) {
		// 1000 -> "1,000X"
		return `${Intl.NumberFormat().format(m)}X`;
	}
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

<!--{#if shouldShowMultiplier(props.rawSymbol, props.state)}
	<BitmapText
			anchor={0.5}
			x={props.x}
			y={props.y - SYMBOL_SIZE * 0.18}
	text={formatMultiplier(props.rawSymbol.multiplier)}
	style={{
	fontFamily: 'gold',
	fontSize: Math.round(SYMBOL_SIZE * 0.38),
	align: 'center',
	letterSpacing: 1
}}
	tint={0xFFFFFF}
	dropShadow={true}
	dropShadowAlpha={0.8}
	dropShadowAngle={1.2}
	dropShadowBlur={0}
	dropShadowDistance={2}
	zIndex={10}
	/>
{/if}-->

{#if props.rawSymbol.multiplier}
	<BitmapText
		anchor={0.5}
		x={props.x}
		y={props.y}
		text={`${props.rawSymbol.multiplier}1X`}
		style={{
			fontFamily: 'gold',
			fontSize: 50,
		}}
	/>
{/if}


