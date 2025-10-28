<script lang="ts" module>
	import type { RawSymbol, Position } from '../game/types';
	import { Container } from 'pixi-svelte';
	export type EmitterEventBoard =
			| { type: 'boardSettle'; board: RawSymbol[][] }
			| { type: 'boardShow' }
			| { type: 'boardHide' }
			| {
		type: 'boardWithAnimateSymbols';
		symbolPositions: Position[];
	};
</script>

<script lang="ts">
	import { waitForResolve } from 'utils-shared/wait';
	import { BoardContext } from 'components-shared';

	import { getContext } from '../game/context';
	import BoardContainer from './BoardContainer.svelte';
	import BoardMask from './BoardMask.svelte';
	import BoardBase from './BoardBase.svelte';

	const context = getContext();

	let show = $state(true);

	// Безопасни sub-ове: пазим от липсващ enhancedBoard/board/reelState
	context.eventEmitter.subscribeOnMount({
		stopButtonClick: () => context.stateGameDerived?.enhancedBoard?.stop?.(),
		boardSettle: ({ board }) => context.stateGameDerived?.enhancedBoard?.settle?.(board),
		boardShow: () => (show = true),
		boardHide: () => (show = false),

		boardWithAnimateSymbols: async ({ symbolPositions }) => {
			const getPromises = () => {
				const reels = context.stateGame?.board ?? [];
				return symbolPositions.map(async (position) => {
					// guard-ове за безопасен достъп
					const reel = reels[position?.reel];
					if (!reel) return;

					// гарантираме структура на reelState
					reel.reelState ||= {} as typeof reel.reelState;
					const symbols = (reel.reelState as any).symbols as Array<{
						symbolState: string;
						oncomplete?: () => void;
					}> | undefined;

					const reelSymbol = symbols?.[position?.row];
					if (!reelSymbol) return;

					// анимираме безопасно
					reelSymbol.symbolState = 'win';
					await waitForResolve((resolve) => (reelSymbol.oncomplete = resolve));
					reelSymbol.symbolState = 'postWinStatic';
				});
			};

			const promises = getPromises();
			// филтрираме undefined (ако има пропуснати)
			await Promise.all(promises.filter(Boolean) as Promise<void>[]);
		},
	});

	// стартираме, само ако enhancedBoard го има
	context.stateGameDerived?.enhancedBoard?.readyToSpinEffect?.();
</script>

<Container>
	{#if show}
		<BoardContext animate={false}>
			<BoardContainer>
				<BoardMask />
				<BoardBase />
			</BoardContainer>
		</BoardContext>

		<BoardContext animate={true}>
			<BoardContainer>
				<BoardBase />
			</BoardContainer>
		</BoardContext>
	{/if}
</Container>
