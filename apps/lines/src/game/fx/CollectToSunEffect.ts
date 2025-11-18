import {
    Container,
    Assets,
    Sprite as PixiSprite,
    Texture,
    type DisplayObject,
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

    const skeletonUrl = coinCfg.src.skeleton;
    const atlasUrl = coinCfg.src.atlas;

    // Проверка дали URL-ът съществува в кеша
    if (!Assets.cache.has(skeletonUrl)) {
        console.warn(`[FX] Cache miss for URL: ${skeletonUrl}`);
        return fallbackSprite();
    }

    try {
        // 3. СЪЗДАВАМЕ SPINE ЧРЕЗ URL-ИТЕ ОТ КОНФИГА
        // Подаваме обект, за да сме сигурни, че ще върже правилния атлас с правилния скелет
        const spine = Spine.from({
            skeleton: skeletonUrl,
            atlas: atlasUrl,
        });

        // Прилагаме мащаба директно от конфига
        spine.scale.set(coinCfg.src.scale || 0.2);

        // Защити
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

    constructor(boardContainer: Container, data: Container) {
        this.boardContainer = boardContainer;
        this.data = data;

        this.coinsContainer = new Container();
        this.coinsContainer.position.set(0, 0);
        this.boardContainer.addChild(this.coinsContainer);
    }

    public async play(): Promise<void> {
        const itemsForTimeline: FlyAmountOptions[] = this.data.items.map((it) => ({
            overlayLayer: this.coinsContainer,
            fromGlobal: { x: it.x, y: it.y },
            toGlobal: this.data.toGlobal,
            makeVisual: makeCoin,
            duration: 1.0,
            curveHeight: 100,
            ease: 'power2.out',
        }));

        await flyAmountsGsapTimeline(itemsForTimeline, {
            staggerFraction: 0.15,
        });
    }
}