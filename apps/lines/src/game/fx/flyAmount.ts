import { Container, Point, type DisplayObject } from 'pixi.js';
import { gsap } from 'gsap';
import { PixiPlugin } from 'gsap/PixiPlugin';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(PixiPlugin, MotionPathPlugin);

export type CoordLike = { x: number; y: number };

export interface FlyAmountOptions {
    overlayLayer: Container;
    fromGlobal: CoordLike;
    toGlobal:   CoordLike;
    makeVisual: () => DisplayObject;
    duration?: number;
    curveHeight?: number;
    ease?: string;
}

/**
 * ЕДИНИЧЕН полет
 * Взима ГЛОБАЛНИ координати и ги преобразува в ЛОКАЛНИ спрямо overlayLayer.
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
        const isFromValid = fromGlobal && typeof fromGlobal.x === 'number' && typeof fromGlobal.y === 'number';
        const isToValid = toGlobal && typeof toGlobal.x === 'number' && typeof toGlobal.y === 'number';

        if (!isFromValid || !isToValid) {
            console.error('FlyAmountGsap ERROR: Invalid global coordinates.', { fromGlobal, toGlobal });
            return resolve();
        }

        const ghost = makeVisual();
        overlayLayer.addChild(ghost);
        ghost.alpha = 1.0;

        // --- ВАЖНО: Преобразуваме Глобални -> Локални (спрямо слоя) ---
        const globalStart = new Point(fromGlobal.x, fromGlobal.y);
        const globalEnd   = new Point(toGlobal.x, toGlobal.y);

        const fromLocal = overlayLayer.toLocal(globalStart);
        const toLocal   = overlayLayer.toLocal(globalEnd);
        // -------------------------------------------------------------

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
            alpha: 0, // Изчезва напълно в края
            onComplete: () => {
                ghost.destroy({ children: true });
                resolve();
            },
        });
    });
}

/**
 * МНОГО полети (Timeline)
 */
export function flyAmountsGsapTimeline(
    items: FlyAmountOptions[],
    {
        staggerFraction = 0.2,
    }: { staggerFraction?: number } = {},
): Promise<void> {
    return new Promise<void>((resolve) => {
        if (!items.length) return resolve();

        const tl = gsap.timeline({
            onComplete: () => resolve(),
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

            // Валидация
            const isFromValid = fromGlobal && typeof fromGlobal.x === 'number';
            const isToValid = toGlobal && typeof toGlobal.x === 'number';
            if (!isFromValid || !isToValid) return;

            const ghost = makeVisual();
            overlayLayer.addChild(ghost);
            ghost.alpha = 1.0;

            // --- ВАЖНО: Преобразуваме Глобални -> Локални тук също ---
            const globalStart = new Point(fromGlobal.x, fromGlobal.y);
            const globalEnd   = new Point(toGlobal.x, toGlobal.y);

            const fromLocal = overlayLayer.toLocal(globalStart);
            const toLocal   = overlayLayer.toLocal(globalEnd);
            // -------------------------------------------------------

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
                    alpha: 0,
                    onComplete: () => {
                        ghost.destroy({ children: true });
                    },
                },
                currentStartTime,
            );

            previousDuration = duration;
        });

        if (!hasTweens) resolve();
    });
}