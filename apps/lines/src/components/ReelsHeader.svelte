<script lang="ts">
    import { Sprite } from 'pixi-svelte';
    import { getContext } from '../game/context';
    import { uiPositions } from '../state/uiPositions'; // глобален store за координати

    const context = getContext();

    // важното: тези две стойности трябва да съвпадат с BoardFrame
    const FRAME_SCALE_W = 2.0;
    const FRAME_SCALE_H = 1.06;

    // тунинг (намалено слънце + лека корекция по Y)
    const TOP_COLL_W_RATIO = 0.8;  // беше 1.00 → по-малко "слънце"
    const TOP_COLL_Y_RATIO = 0.27; // 0.30H над горния ръб на рамката

    // логото ZEUS – оставям както го ползваш, пипни ако искаш още
    const TOP_LOGO_W_RATIO = 0.4;
    const TOP_LOGO_Y_RATIO = 0.07;

    // ---------- derived ----------
    const b        = $derived(context.stateGameDerived.boardLayout());
    const centerX  = $derived(b.x);
    const centerY  = $derived(b.y);
    const visualW  = $derived(b.width  * FRAME_SCALE_W);
    const visualH  = $derived(b.height * FRAME_SCALE_H);

    // Y на горния ръб на рамката (centerY - visualH/2)
    const topEdgeY = $derived(centerY - visualH / 2);

    // coin/glow (само width -> Sprite пази aspect ratio)
    const collW = $derived(visualW * TOP_COLL_W_RATIO);
    const collY = $derived(topEdgeY - visualH * TOP_COLL_Y_RATIO);

    // ZEUS logo
    const logoW = $derived(visualW * TOP_LOGO_W_RATIO);
    const logoY = $derived(topEdgeY - visualH * TOP_LOGO_Y_RATIO);

    // ---------- новите стойности: запис в глобален стейт ----------
    // пазим актуалните координати за други модули (анимации, позициониране и пр.)
    $effect(() => {
        uiPositions.update((s) => ({
            ...s,
            sunAbove: { x: centerX, y: collY },
            zeusLogo: { x: centerX, y: logoY },
        }));
    });
</script>

<!-- Слънцето/монетата над рийлсета -->
<Sprite
        key="pesudo_collection_above_reels.png"
        anchor={0.5}
        x={centerX}
        y={collY}
        width={collW}
        scale={0.6}
        zIndex={-0.6}
        name="sunAbove"
/>

<!-- ZEUS -->
<Sprite
        key="game_logo.png"
        anchor={0.5}
        x={centerX}
        y={logoY}
        width={logoW}
        scale={0.6}
        zIndex={-0.39}
/>
