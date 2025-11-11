import {flyAmountGsap} from "./flyAmount";
import type {Container, DisplayObject} from 'pixi.js';
// !!! ДОБАВИМЕ ЛИПСВАЩИ ИМПОРТИ, АКО НЕ СА ГЛОБАЛНИ !!!
import {Sprite as PixiSprite, Texture} from 'pixi.js';

interface CollectEffectData {
    items: { x: number, y: number }[];
    toGlobal: { x: number, y: number };
}

// Твоят хелпър
const makeCoin = (): DisplayObject => {
    const s = new PixiSprite(Texture.from('pesudo_collection_above_reels.png'));
    s.anchor.set(0.5);
    s.scale.set(0.10);
    s.name = 'FlyingCoinSprite'; // Добавяме име за дебъг
    return s;
};


export class CollectToSunEffect {
    private overlayLayer: Container;
    private data: CollectEffectData;

    // Конструкторът е почистен
    constructor(overlayLayer: Container, data: CollectEffectData) {
        this.overlayLayer = overlayLayer;
        this.data = data;
    }

    public async play(): Promise<void> {
        console.log(`[FX] Starting GSAP collect animation for ${this.data.items.length} items.`);
        const promises: Promise<void>[] = [];

        // ... цикълът е същият
        for (const it of this.data.items) {

            const animationPromise = flyAmountGsap({
                overlayLayer: this.overlayLayer,
                fromGlobal: { x: it.x, y: it.y },
                toGlobal: this.data.toGlobal,

                // КЛЮЧОВАТА ПРОМЯНА: ИЗПОЛЗВАМЕ ТВОЯ ХЕЛПЪР
                makeVisual: makeCoin,

                duration: 0.8,
                curveHeight: 100,
                ease: 'power2.out',
            });

            promises.push(animationPromise);
        }

        await Promise.all(promises);
        console.log(`[FX] GSAP collect animation finished.`);
    }
}