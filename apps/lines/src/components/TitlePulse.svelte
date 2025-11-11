<script lang="ts">
    import { Sprite } from 'pixi-svelte';
    import { tweened } from 'svelte/motion';
    import { sineInOut } from 'svelte/easing';
    import { onMount, onDestroy } from 'svelte';

    type Props = {
        /** ключът на изображението от атласа */
        keyName?: string;
        /** позиция */
        x?: number;
        y?: number;
        /** anchor: 0.5 или [0.5, 0.5] за център */
        anchor?: number | [number, number];
        /** среден скейл */
        baseScale?: number;
        /** амплитуда на пулса (±) */
        pulseAmp?: number;
        /** продължителност на половин цикъл (ms) */
        duration?: number;
        /** прозрачност и z-index */
        alpha?: number;
        zIndex?: number;
    };

    const props = $props<Props>();
    const keyName   = 'lightning_cash_cash.png';
    const x         = $derived(props.x         ?? 0);
    const y         = $derived(props.y         ?? 0);
    const anchor    = $derived(props.anchor    ?? 0.5);
    const baseScale = $derived(props.baseScale ?? 1.0);
    const pulseAmp  = $derived(props.pulseAmp  ?? 0.06);  // ~6% дишане
    const duration  = $derived(props.duration  ?? 900);   // 0.9s половин цикъл
    const alpha     = $derived(props.alpha     ?? 1);
    const zIndex    = $derived(props.zIndex    ?? 999);   // над лоудъра

    // tween за скейла
    const scale = tweened(baseScale, { duration, easing: sineInOut });

    let alive = true;
    onMount(async () => {
        // безкрайно „дишане“
        while (alive) {
            await scale.set(baseScale + pulseAmp, { duration, easing: sineInOut });
            await scale.set(baseScale - pulseAmp, { duration, easing: sineInOut });
        }
    });
    onDestroy(() => { alive = false; });
</script>

<!-- Пулсиращо лого -->
<Sprite
        key={keyName}
        anchor={anchor}
        x={x}
        y={y}
        scale={$scale}
        alpha={alpha}
        zIndex={zIndex}
/>
