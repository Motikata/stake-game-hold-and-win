import { Container, Point, type DisplayObject } from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

export type CoordLike = { x: number; y: number };

export interface FlyAmountOptions {
    overlayLayer: Container;            // слой върху сцената (в app.stage над HUD/борд)
    fromGlobal: CoordLike;              // старт (логически „глобални“ координати)
    toGlobal:   CoordLike;              // край  (логически „глобални“ координати)
    makeVisual: () => DisplayObject;    // създава визуал (Sprite/Container/Text)
    duration?: number;                  // продължителност (s)
    curveHeight?: number;               // височина на арката
    ease?: string;                      // ease (напр. power2.inOut)
}

/**
 * ЕДИНИЧЕН полет – ако ти трябва да пускаш по един обект.
 */
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
        const isFromValid =
            fromGlobal && typeof fromGlobal.x === 'number' && typeof fromGlobal.y === 'number';
        const isToValid =
            toGlobal && typeof toGlobal.x === 'number' && typeof toGlobal.y === 'number';

        if (!isFromValid || !isToValid) {
            console.error(
                'FlyAmountGsap ERROR: Invalid global coordinates received. Aborting tween.',
                {
                    fromGlobal,
                    isFromValid,
                    toGlobal,
                    isToValid,
                },
            );
            return resolve();
        }

        const ghost = makeVisual();
        overlayLayer.addChild(ghost);
        ghost.alpha = 1.0;

        const fromLocal = new Point(fromGlobal.x, fromGlobal.y);
        const toLocal   = new Point(toGlobal.x,   toGlobal.y);

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
            alpha: 0.3,
            onComplete: () => {
                ghost.destroy({ children: true });
                resolve();
            },
        });
    });
}

/**
 * МНОГО полети в GSAP timeline:
 * staggerFraction = 0.2 означава:
 * – 2-рият тръгва, когато 1-вият е минал 20% от своята продължителност
 * – 3-тият тръгва, когато 2-рият е минал 20%, и т.н.
 */
export function flyAmountsGsapTimeline(
    items: FlyAmountOptions[],
    {
        staggerFraction = 0.2, // 0 = всички наведнъж, 1 = без застъпване, 0.2 = 20% прогрес преди следващия
    }: { staggerFraction?: number } = {},
): Promise<void> {
    return new Promise<void>((resolve) => {
        if (!items.length) {
            return resolve();
        }

        const tl = gsap.timeline({
            onComplete: () => {
                resolve();
            },
        });

        let hasTweens = false;
        let currentStartTime = 0;
        let previousDuration = 0;

        items.forEach((opts, index) => {
            const {
                overlayLayer,
                fromGlobal,
                toGlobal,
                makeVisual,
                duration = 0.9,
                curveHeight = 160,
                ease = 'power2.out',
            } = opts;

            const isFromValid =
                fromGlobal && typeof fromGlobal.x === 'number' && typeof fromGlobal.y === 'number';
            const isToValid =
                toGlobal && typeof toGlobal.x === 'number' && typeof toGlobal.y === 'number';

            if (!isFromValid || !isToValid) {
                console.error(
                    'flyAmountsGsapTimeline ERROR: Invalid global coordinates for item. Skipping tween.',
                    {
                        index,
                        fromGlobal,
                        isFromValid,
                        toGlobal,
                        isToValid,
                    },
                );
                return;
            }

            const ghost = makeVisual();
            overlayLayer.addChild(ghost);
            ghost.alpha = 1.0;

            const fromLocal = new Point(fromGlobal.x, fromGlobal.y);
            const toLocal   = new Point(toGlobal.x,   toGlobal.y);

            ghost.position.copyFrom(fromLocal);

            const midX = (fromLocal.x + toLocal.x) / 2;
            const midY = Math.min(fromLocal.y, toLocal.y) - Math.abs(curveHeight);

            if (index === 0) {
                currentStartTime = 0;
            } else {
                currentStartTime += previousDuration * staggerFraction;
            }

            hasTweens = true;

            tl.to(
                ghost,
                {
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
                    alpha: 0.3,
                    onComplete: () => {
                        ghost.destroy({ children: true });
                    },
                },
                currentStartTime,
            );

            previousDuration = duration;
        });

        if (!hasTweens) {
            resolve();
        }
    });
}
