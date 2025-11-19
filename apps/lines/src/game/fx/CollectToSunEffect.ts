import {
    Container,
    Assets,
    Sprite as PixiSprite,
    Texture,
    type DisplayObject,
    Point,
    Graphics,
} from 'pixi.js';

import {
    flyAmountsGsapTimeline,
    type FlyAmountOptions,
} from './flyAmount';
import { Spine } from "@esotericsoftware/spine-pixi-v8";

import AssetsConfig from '../assets';

export interface CollectEffectData {
    items: { x: number; y: number }[];
    toGlobal: { x: number; y: number };
}

const fallbackSprite = (): DisplayObject => {
    const s = new PixiSprite(Texture.from('pesudo_collection_above_reels.png'));
    s.anchor.set(0.5);
    s.scale.set(0.15);
    return s;
};

const makeCoin = (): DisplayObject => {
    const coinCfg = AssetsConfig.coin;
    if (!coinCfg) return fallbackSprite();

    const skeletonUrl = coinCfg.src.skeleton;
    const atlasUrl = coinCfg.src.atlas;

    if (!Assets.cache.has(skeletonUrl)) {
        return fallbackSprite();
    }

    try {
        const spine = Spine.from({
            skeleton: skeletonUrl,
            atlas: atlasUrl,
        });

        spine.scale.set(coinCfg.src.scale || 0.2);

        if (!spine || !spine.skeleton || !spine.skeleton.data) {
            return fallbackSprite();
        }

        const animations = spine.skeleton.data.animations;
        if (animations && animations.length > 0) {
            spine.state.setAnimation(0, animations[0].name, true);
        }

        return spine as unknown as DisplayObject;

    } catch (err) {
        console.error('[FX] Spine create error', err);
        return fallbackSprite();
    }
};

export class CollectToSunEffect {
    private boardContainer: Container;
    private coinsContainer: Container;
    private data: CollectEffectData;

    // Константите от Svelte файла
    private readonly POSITION_ADJUSTMENT_X = 1;
    private readonly POSITION_ADJUSTMENT_Y = 1.11;

    constructor(boardContainer: Container, data: CollectEffectData) {
        this.boardContainer = boardContainer;
        this.data = data;

        this.coinsContainer = new Container();

        // --- ПОЗИЦИОНИРАНЕ СПРЯМО SVELTE ЛОГИКАТА ---
        // Изчисляваме офсета, нужен за да постигнем * 1.11 ефекта.
        // Тъй като coinsContainer е вътре в boardContainer, местим го локално.

        const offsetX = this.boardContainer.position.x * (this.POSITION_ADJUSTMENT_X - 1);
        const offsetY = this.boardContainer.position.y * (this.POSITION_ADJUSTMENT_Y - 1);

        this.coinsContainer.position.set(offsetX, offsetY);
        // ----------------------------------------------

        // @ts-ignore
        this.coinsContainer.label = "CoinsContainer";
        this.boardContainer.addChild(this.coinsContainer);
    }

    public async play(): Promise<void> {
        console.log(`%c[FX DEBUG] START COLLECT EFFECT`, 'background:#222;color:#bada55');

        // 1. Смятаме ФИНАЛА (Слънцето) - Координатите са ГЛОБАЛНИ
        const targetGlobal = new Point(this.data.toGlobal.x, this.data.toGlobal.y);

        // 2. Преобразуваме крайната точка в локална за рисуване на Debug точката
        const targetLocalForDebug = this.coinsContainer.toLocal(targetGlobal);

        // --- DEBUG: Рисуваме ЗЕЛЕНА точка на финала ---
        const debugEnd = new Graphics();
        debugEnd.beginFill(0x00FF00);
        debugEnd.drawCircle(0, 0, 15);
        debugEnd.endFill();
        debugEnd.position.set(targetLocalForDebug.x, targetLocalForDebug.y);
        this.coinsContainer.addChild(debugEnd);
        // ---------------------------------------------

        const itemsForTimeline: FlyAmountOptions[] = this.data.items.map((it, index) => {

            // 1. Взимаме данните от 'it', които са ЛОКАЛНИ за Борда
            const symbolPosLocal = new Point(it.x, it.y);

            // 2. ПРЕВРЪЩАНЕ: Локални (в Борда) -> Глобални (за Екрана)
            // Използваме BoardContainer, за да трансформираме локалните в глобални
            const symbolPosGlobal = this.boardContainer.toGlobal(symbolPosLocal);

            // 3. Преобразуваме началната точка в локална за рисуване на Debug точката
            const startLocalForDebug = this.coinsContainer.toLocal(symbolPosGlobal);


            // --- DEBUG: Рисуваме ЧЕРВЕНА точка на старта ---
            const debugStart = new Graphics();
            debugStart.beginFill(0xFF0000);
            debugStart.drawCircle(0, 0, 10);
            debugStart.endFill();
            debugStart.position.set(startLocalForDebug.x, startLocalForDebug.y);
            this.coinsContainer.addChild(debugStart);
            // -----------------------------------------------

            // --- ЛОГВАМЕ ТРИТЕ КООРДИНАТИ ---
            console.log(`%cItem ${index}:`, 'color: #ffd700');
            console.log(`  - Local in Board (Input): [${symbolPosLocal.x | 0}, ${symbolPosLocal.y | 0}]`);
            console.log(`  - Global on Screen: [${symbolPosGlobal.x | 0}, ${symbolPosGlobal.y | 0}]`);
            console.log(`  - Local in CoinsContainer (Tween Start): [${startLocalForDebug.x | 0}, ${startLocalForDebug.y | 0}]`);
            // ---------------------------------


            return {
                overlayLayer: this.coinsContainer,

                // Подаваме ГЛОБАЛНИТЕ координати на хелпъра
                fromGlobal: { x: symbolPosGlobal.x, y: symbolPosGlobal.y },
                toGlobal:   this.data.toGlobal, // Слънцето е ГЛОБАЛНО

                makeVisual: makeCoin,

                duration: 1.0,
                curveHeight: 100,
                ease: 'power2.out',
            };
        });

        await flyAmountsGsapTimeline(itemsForTimeline, {
            staggerFraction: 0.15,
        });

        // 4. ПОЧИСТВАНЕ
        this.coinsContainer.destroy({ children: true });
    }
}