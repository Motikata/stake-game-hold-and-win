<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';

	import { EnableHotkey, getContextBoard } from 'components-shared';
	import { MainContainer } from 'components-layout';
	import { App, REM, Text, Container as SContainer } from 'pixi-svelte';
	import { stateModal } from 'state-shared';

	import { UI, UiGameName } from 'components-ui-pixi';
	import { GameVersion, Modals } from 'components-ui-html';

	import { getContext } from '../game/context';
	import { EnablePixiExtension } from 'components-pixi';
	import EnableSound from './EnableSound.svelte';
	import EnableGameActor from './EnableGameActor.svelte';
	import ResumeBet from './ResumeBet.svelte';
	import Sound from './Sound.svelte';
	import Background from './Background.svelte';
	import LoadingScreen from './LoadingScreen.svelte';
	import BoardFrame from './BoardFrame.svelte';
	import Board from './Board.svelte';
	import Anticipations from './Anticipations.svelte';
	import Win from './Win.svelte';
	import FreeSpinIntro from './FreeSpinIntro.svelte';
	import FreeSpinCounter from './FreeSpinCounter.svelte';
	import FreeSpinOutro from './FreeSpinOutro.svelte';
	import Transition from './Transition.svelte';
	import ReelsHeader from './ReelsHeader.svelte';
	import JackpotMeters from './JackpotMeters.svelte';
	import { showCashDemo } from '../game/showCashDemo';
	import OverlayLayer from "../game/fx/OverlayLayer.svelte";


	const context = getContext();

	onMount(() => (context.stateLayout.showLoadingScreen = true));

	context.eventEmitter.subscribeOnMount({
		buyBonusConfirm: () => {
			stateModal.modal = { name: 'buyBonusConfirm' };
		},
	});

	// достъпно в конзолата за тестове
	(window as any).showCashDemo = showCashDemo;

</script>

<App name="HoldAndWinGame">
	<EnablePixiExtension />
	<EnableSound />
	<EnableHotkey />
	<EnableGameActor />

	<Background name="Background" />

	{#if context.stateLayout.showLoadingScreen}
		<LoadingScreen onloaded={() => (context.stateLayout.showLoadingScreen = false)} />
	{:else}
		<ResumeBet />
		<!-- Autoplay: звуците след потребителско действие -->
		<Sound />

		<MainContainer name="ReelsAndJackpotContainer">
			<ReelsHeader />
			<JackpotMeters />
			<BoardFrame />
		</MainContainer>

		<MainContainer name="BoardAndAnticipationsContainer">
			<Board />
			<Anticipations />
		</MainContainer>
		<OverlayLayer/>
		<UI>
			{#snippet gameName()}
				<UiGameName name="Lightning cash" />
			{/snippet}
			{#snippet logo()}
				<Text
						anchor={{ x: 1, y: 0 }}
						text=""
						style={{
						fontFamily: 'proxima-nova',
						fontSize: REM * 1.5,
						fontWeight: '600',
						lineHeight: REM * 2,
						fill: 0xffffff
					}}
				/>
			{/snippet}
		</UI>

		<Win />
		<FreeSpinIntro />
		{#if ['desktop', 'landscape'].includes(context.stateLayoutDerived.layoutType())}
			<FreeSpinCounter />
		{/if}
		<FreeSpinOutro />
		<Transition />
	{/if}
</App>

<Modals>
	{#snippet version()}
		<GameVersion version="0.0.1" />
	{/snippet}
</Modals>
