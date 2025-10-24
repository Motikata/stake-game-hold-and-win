<script lang="ts">
    import { Sprite, BitmapText } from 'pixi-svelte';
    import { getContext } from '../game/context';

    type Amounts = {
        grand: string; mega: string; minor: string; mini: string;
        currencyPrefix?: string; currencySuffix?: string;
    };
    const DEFAULT_AMOUNTS: Amounts = {
        grand: '123,456.00', mega: '123,456.00', minor: '123,456.00', mini: '123,456.00',
        currencyPrefix: '', currencySuffix: '',
    };
    const props   = $props<{ amounts?: Amounts }>();
    const amounts = $derived(props.amounts ?? DEFAULT_AMOUNTS);

    // atlas keys
    const BG_LARGE  = 'grand_mega_jpt_meter.png';
    const BG_SMALL  = 'minor_mini_jpt_meter.png';
    const TXT_GRAND = 'grand_jpt_text.png';
    const TXT_MEGA  = 'mega_jpt_text.png';
    const TXT_MINOR = 'minor_jpt_text.png';
    const TXT_MINI  = 'mini_jpt_text.png';

    const ctx = getContext();

    const ELEMENTS_SCALE = 0.6;
    const UP_DOWN_OFFSET = 90;
    // същата визуална рамка като BoardFrame
    const FRAME_SCALE_W = 2.00;
    const FRAME_SCALE_H = 2;

    // ── тунинг (основни) ──────────────────────────────────────────────────────
    // *МЕТЕРИТЕ НАД РАМКАТА*: отрицателен offset ги качва над топ-ръба
    const TOP_OVER_OFFSET = 0.045;    // 4.5% от височината НАГОРЕ от topEdge
    const GAP_Y_RATIO     = 0.240;    // разстояние между горен/долен метер

    // хоризонтално раздалечаване към краищата
    const SIDE_X_OFFSET   = 0.355;    // 34.5% навън от центъра

    // ширини (малко по-компактни)
    const LARGE_W_RATIO   = 0.382;    // GRAND/MEGA
    const SMALL_W_RATIO   = 0.320;    // MINOR/MINI

    // етикети (label sprites) – леко по-малки
    const LABEL_W_RATIO_L = 0.36;
    const LABEL_W_RATIO_S = 0.40;

    // размер на сумата
    const AMOUNT_SIZE_L   = 0.118;
    const AMOUNT_SIZE_S   = 0.145;

    // фини вертикални корекции вътре в плочките
    const LABEL_DY_L      = -0.125;   // в единици от ширината на фона
    const AMOUNT_DY_L     =  0.020;
    const LABEL_DY_S      = -0.120;
    const AMOUNT_DY_S     =  0.026;

    // ── derived спрямо борда ──────────────────────────────────────────────────
    const b        = $derived(ctx.stateGameDerived.boardLayout());
    const cx       = $derived(b.x);
    const cy       = $derived(b.y);
    const vW       = $derived(b.width  * FRAME_SCALE_W);
    const vH       = $derived(b.height * FRAME_SCALE_H);
    const topY     = $derived(cy - vH / 2);                     // top edge на визуалната рамка

    const largeW   = $derived(vW * LARGE_W_RATIO);
    const smallW   = $derived(vW * SMALL_W_RATIO);

    const leftX    = $derived(cx - vW * SIDE_X_OFFSET);
    const rightX   = $derived(cx + vW * SIDE_X_OFFSET);

    // y за горния/долния ред – горният е НАД ръба
    const yTop     = $derived(topY - vH * TOP_OVER_OFFSET);
    const yBottom  = $derived(yTop + vH * GAP_Y_RATIO);

    const labelW_L = $derived(largeW * LABEL_W_RATIO_L);
    const labelW_S = $derived(smallW * LABEL_W_RATIO_S);

    const amountSizeLarge = $derived(largeW * AMOUNT_SIZE_L);
    const amountSizeSmall = $derived(smallW * AMOUNT_SIZE_S);

    const fmt = (v: string) => `${amounts.currencyPrefix ?? ''}${v}${amounts.currencySuffix ?? ''}`;
</script>

<!--ГОРЕ ЛЯВО-->
<Sprite key="grand_mega_jpt_meter.png" anchor={0.5} x={leftX}  y={yTop + UP_DOWN_OFFSET}    scale={ELEMENTS_SCALE}  zIndex={-7}/>
<Sprite key="grand_jpt_text.png"      anchor={0.5} x={leftX - 10}  y={yTop + UP_DOWN_OFFSET + largeW*LABEL_DY_L} scale={ELEMENTS_SCALE} zIndex={-7}/>
<BitmapText
        anchor={0.5}
        x={leftX - 10}
        y={yTop + UP_DOWN_OFFSET + largeW*AMOUNT_DY_L}
        text={fmt(amounts.grand)}
        style={{ fontFamily: 'gold', fontSize: amountSizeLarge }}
        zIndex={0.35}
/>

<!--ДОЛУ ЛЯВО-->
<Sprite key="minor_mini_jpt_meter.png" anchor={0.5} x={leftX - 10}  y={yBottom} scale={ELEMENTS_SCALE}  zIndex={-7}/>
<Sprite key="minor_jpt_text.png"       anchor={0.5} x={leftX - 10}  y={yBottom + smallW*LABEL_DY_S} scale={ELEMENTS_SCALE} zIndex={-7}/>
<BitmapText
        anchor={0.5}
        x={leftX - 10}
        y={yBottom + smallW*AMOUNT_DY_S}
        text={fmt(amounts.minor)}
        style={{ fontFamily: 'gold', fontSize: amountSizeSmall }}
        zIndex={0.35}
/>

<!--ГОРЕ ДЯСНО-->
<Sprite key="grand_mega_jpt_meter.png" anchor={0.5} x={rightX} y={yTop + UP_DOWN_OFFSET}    scale={ELEMENTS_SCALE}  zIndex={-7}/>
<Sprite key="mega_jpt_text.png"        anchor={0.5} x={rightX + 10} y={yTop + UP_DOWN_OFFSET + largeW*LABEL_DY_L} scale={ELEMENTS_SCALE} zIndex={-7}/>
<BitmapText
        anchor={0.5}
        x={rightX + 10}
        y={yTop + UP_DOWN_OFFSET + largeW*AMOUNT_DY_L}
        text={fmt(amounts.mega)}
        style={{ fontFamily: 'gold', fontSize: amountSizeLarge }}
        zIndex={0.35}
/>

<!--ДОЛУ ДЯСНО-->
<Sprite key="minor_mini_jpt_meter.png" anchor={0.5} x={rightX + 10} y={yBottom} scale={ELEMENTS_SCALE}  zIndex={-7}/>
<Sprite key="mini_jpt_text.png"        anchor={0.5} x={rightX + 10} y={yBottom + smallW*LABEL_DY_S} scale={ELEMENTS_SCALE} zIndex={-7}/>
<BitmapText
        anchor={0.5}
        x={rightX + 10}
        y={yBottom + smallW*AMOUNT_DY_S}
        text={fmt(amounts.mini)}
        style={{ fontFamily: 'gold', fontSize: amountSizeSmall }}
        zIndex={0.35}
/>
