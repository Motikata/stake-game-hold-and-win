<script lang="ts" module>
	export type EmitterEventBoardFrame =
			| { type: 'boardFrameGlowShow' }
			| { type: 'boardFrameGlowHide' };
</script>

<script lang="ts">
	import { Sprite, SpineProvider, SpineTrack } from 'pixi-svelte';
	import { getContext } from '../game/context';

	const context = getContext();

	const SPINE_SCALE = { width: 0.62, height: 0.66 };
	const SPRITE_SCALE_W = 2;
	const SPRITE_SCALE_H = 1.45;
	const POSITION_ADJUSTMENT_X = 1;
	const POSITION_ADJUSTMENT_Y = 1.11;

	// inner area – всичко вътре се оразмерява по него
	const INNER_PAD_X = 0.010;   // 1% хор. пад
	const INNER_PAD_Y = 0.000;   // 0% верт. пад (без „въздух“)
	const COLS = 3;

	// дивайдери
	const DIVIDER_WIDTH_RATIO  = 0.006;
	const DIVIDER_ALPHA        = 0.85;

	// „27 WAYS“ тагове
	const TAG_WIDTH_RATIO  = 0.13;
	const TAG_HEIGHT_RATIO = 0.32;
	const TAG_X_OFFSET_RATIO = 0.93;
	const TAG_Y_OFFSET_RATIO = 0.0;
	const TAG_SCALE = 0.6;

	type AnimationName =
			| 'reelhouse_glow_start'
			| 'reelhouse_glow_idle'
			| 'reelhouse_glow_exit';

	let animationName = $state<AnimationName | undefined>(undefined);
	let loop = $state(false);

	function boardRect() {
		return context.stateGameDerived.boardLayout();
	}

	// derived
	const _board       = $derived(boardRect());
	const centerX      = $derived(_board.x * POSITION_ADJUSTMENT_X);
	const centerY      = $derived(_board.y * POSITION_ADJUSTMENT_Y);

	const visualWidth  = $derived(_board.width  * SPRITE_SCALE_W);
	const visualHeight = $derived(_board.height * SPRITE_SCALE_H);

	const innerWidth   = $derived(visualWidth  * (1 - 2 * INNER_PAD_X));
	const innerHeight  = $derived(visualHeight * (1 - 2 * INNER_PAD_Y));
	const innerLeftX   = $derived(centerX - innerWidth / 2);
	const colW         = $derived(innerWidth / COLS);

	const dividerX1    = $derived(innerLeftX + colW);
	const dividerX2    = $derived(innerLeftX + colW * 2);
	const dividerW     = $derived(innerWidth * DIVIDER_WIDTH_RATIO);
	const dividerH     = $derived(innerHeight);
	const dividerY     = $derived(centerY);

	const tagW         = $derived(visualWidth  * TAG_WIDTH_RATIO);
	const tagH         = $derived(visualHeight * TAG_HEIGHT_RATIO);
	const tagY         = $derived(centerY + (visualHeight * TAG_Y_OFFSET_RATIO));
	const tagLeftX     = $derived((centerX - visualWidth * TAG_X_OFFSET_RATIO / 2) - 10);
	const tagRightX    = $derived((centerX + visualWidth * TAG_X_OFFSET_RATIO / 2) + 10);

	context.eventEmitter.subscribeOnMount({
		boardFrameGlowShow: () => {
			animationName = 'reelhouse_glow_start';
			loop = false;
		},
		boardFrameGlowHide: () => {
			if (animationName) animationName = 'reelhouse_glow_exit';
		},
	});
</script>

{#if animationName}
	<SpineProvider
			zIndex={-1}
			key="reelhouse"
			x={centerX}
			y={centerY}
			width={_board.width * SPINE_SCALE.width}
			height={_board.height * SPINE_SCALE.height}
	>
		<SpineTrack
				trackIndex={0}
				{animationName}
				{loop}
				listener={{
        complete: (entry) => {
          const nm = entry.animation?.name;
          if (nm === 'reelhouse_glow_start') {
            animationName = 'reelhouse_glow_idle';
            loop = true;
          } else if (nm === 'reelhouse_glow_exit') {
            animationName = undefined;
            loop = false;
          }
        },
      }}
		/>
	</SpineProvider>
{/if}
<!-- Вертикални дивайдери – тънки, с пълна вътрешна височина -->
{#each [dividerX1, dividerX2] as dx}
	<Sprite
			key="reel_divider.png"
			anchor={0.5}
			x={dx}
			y={dividerY}
			width={dividerW}
			height={dividerH}
			alpha={DIVIDER_ALPHA}
	/>
{/each}
<!-- Рамка -->
<Sprite
		key="3x3_reels_frame.png"
		anchor={0.5}
		x={centerX}
		y={centerY}
		width={visualWidth}
		height={visualHeight}
/>

<!-- Рийл бекграунд панели (3 колони) -->
{#each [0, 1, 2] as i}
	<!-- леко отдръпване по хоризонтал (0.98), височина = innerHeight -->
	<Sprite
			key="base_reelstrip.png"
			anchor={0.5}
			x={innerLeftX + colW * (i + 0.5)}
			y={centerY}
			width={colW * 0.98}
			height={innerHeight}
			alpha={0.95}
			zIndex={-0.5}
	/>
{/each}



<!-- „27 WAYS“ тагове -->
<Sprite
		key="27_ways_tag.png"
		anchor={0.5}
		x={tagLeftX}
		y={tagY}
		width={tagW}
		height={tagH}
		scale={TAG_SCALE}
		zIndex={100}
/>
<Sprite
		key="27_ways_tag.png"
		anchor={0.5}
		x={tagRightX}
		y={tagY}
		width={tagW}
		height={tagH}
		scale={TAG_SCALE}
		zIndex={100}
/>


