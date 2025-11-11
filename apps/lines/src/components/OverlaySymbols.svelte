<script lang="ts">
    import { Container } from 'pixi-svelte';
    import { getContext } from '../game/context';
    import ReelSymbol from './ReelSymbol.svelte'; // Ползваме същия символ
    // !!! Увери се, че импортът към Store-а е правилен
    import { overlaySymbolStore } from '../state/overlaySymbolStore';

    // 1. Абонираме се за Store-а, който държи само символите за овърлей
    const symbolsStore = overlaySymbolStore.data;

    // 2. Реактивна променлива: Това ще държи масива с данните
    $: overlaySymbols = $symbolsStore;

    // Хелпъри: Достъп до игровия контекст
    const context = getContext();
    // Деструктурираме твоите хелпъри за позициониране
    const { reelX, cellCenterY } = context.stateGameDerived.boardLayout();
</script>

{#each overlaySymbols as item (item.reel * 100 + item.row)}

    <Container
            x={reelX(item.reel)}
            y={cellCenterY(item.row)}
            name={`OverlaySymbol_R${item.reel}C${item.row}`}
    >
        <ReelSymbol
                reelIndex={item.reel}
                reelSymbol={{ symbolState: 'overlay', symbol: item.symbolId }}
                isOverlay={true} />

    </Container>

{/each}