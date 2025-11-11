<script lang="ts">
	import { Rectangle } from 'pixi-svelte';
	import { getContext } from '../game/context';
	import { SYMBOL_SIZE, REEL_GAP } from '../game/constants';

	type Props = { debug?: boolean };
	const props: Props = $props();

	const context = getContext();
	const board = $derived(context.stateGameDerived.boardLayout());

	// --- ПАДИНГИ НА МАСКАТА ---
	// хоризонтално: малко въздух, за да не режем при по-голям gap
	const PAD_X = Math.max(SYMBOL_SIZE * 0.25, REEL_GAP * 0.5);

	// вертикално: държим супер малко, за да стои в рамката
	// ако още „цъка“ при bounce – вдигни 0.08 → 0.10–0.12
	const OVERSCAN_Y_RATIO = 0; // 8% от височината на символа
	//const PAD_Y = Math.round(SYMBOL_SIZE * OVERSCAN_Y_RATIO);
</script>

{#if props.debug}
	<Rectangle
			name="BoardMaskRectangle_Debug"
			alpha={0.2}
			backgroundColor={0xffffff}
			width={board.width}
			height={board.height}
	/>
{/if}

<!-- Маска, малко по-широка, почти същата на височина -->
<Rectangle
		name="BoardMaskRectangle"
		isMask
		x={-PAD_X}
		y={81}
		width={board.width + PAD_X * 2}
		height={board.height + 155}
/>
