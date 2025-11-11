// src/game/runtimeRegistry.ts
import type { Container } from 'pixi.js';

let _overlay: Container | null = null;
let _waiters: Array<(c: Container) => void> = [];

/** Регистрира Pixi Container-а на overlay слоя (вика се от OverlayFx.svelte след mount) */
export function registerOverlay(overlay: Container) {
    _overlay = overlay;
    // събуждаме всички чакащи
    const waiters = _waiters.splice(0);
    waiters.forEach((w) => w(overlay));
}

/** Връща overlay контейнера или изчаква докато бъде регистриран */
export function waitForOverlay(): Promise<Container> {
    return _overlay
        ? Promise.resolve(_overlay)
        : new Promise<Container>((resolve) => _waiters.push(resolve));
}
