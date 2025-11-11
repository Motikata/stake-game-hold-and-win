import { Container, Point } from 'pixi.js';
import type { DisplayObject } from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

export type CoordLike = { x: number; y: number };

export interface FlyAmountOptions {
    overlayLayer: Container;            // слой върху сцената (в app.stage над HUD/борд)
    fromGlobal: CoordLike;              // старт в ГЛОБАЛНИ координати
    toGlobal:   CoordLike;              // край в ГЛОБАЛНИ координати
    makeVisual: () => DisplayObject;    // създава визуал (Sprite/Container/Text)
    duration?: number;                  // продължителност (s)
    curveHeight?: number;               // височина на арката
    ease?: string;                      // ease (напр. power2.inOut)
}

export function flyAmountGsap({
                                  overlayLayer,
                                  fromGlobal,
                                  toGlobal,
                                  makeVisual,
                                  duration = 0.9,
                                  curveHeight = 160,
                                  ease = 'power2.out',
                              }: FlyAmountOptions): Promise<void> {
    return new Promise<void>((resolve) => {

        // --- ДЕБЪГ ЛОГИКА: ПРОВЕРЯВАМЕ ВСИЧКИ ЧАСТИ ---
        const isFromValid = fromGlobal && typeof fromGlobal.x === 'number' && typeof fromGlobal.y === 'number';
        const isToValid = toGlobal && typeof toGlobal.x === 'number' && typeof toGlobal.y === 'number';

        if (!isFromValid || !isToValid) {

            console.error("FlyAmountGsap ERROR: Invalid global coordinates received. Aborting tween.", {
                fromGlobal: fromGlobal,
                isFromValid: isFromValid,
                toGlobal: toGlobal,
                isToValid: isToValid,
            });
            return resolve();
        }
        // ------------------------------------------------

        const ghost = makeVisual();
        overlayLayer.addChild(ghost);
        ghost.alpha = 1.0;

        const fromLocal = overlayLayer.toLocal(new Point(fromGlobal.x, fromGlobal.y));
        const toLocal   = overlayLayer.toLocal(new Point(toGlobal.x, toGlobal.y));

        ghost.position.copyFrom(fromLocal);

        const midX = (fromLocal.x + toLocal.x) / 2;
        const midY = Math.min(fromLocal.y, toLocal.y) - Math.abs(curveHeight);

        gsap.to(ghost, {
            duration,
            ease,
            motionPath: {
                path: [
                    { x: fromLocal.x, y: fromLocal.y },
                    { x: midX,        y: midY },
                    { x: toLocal.x,   y: toLocal.y },
                ],
                autoRotate: false,
            },
            // !!! ФИКС: АНИМИРАНЕ КЪМ АЛФА 0.0 ПРИ КРАЯ !!!
            alpha: 0.0,
            onComplete: () => {
                ghost.destroy({ children: true });
                resolve();
            },
        });
    });
}
