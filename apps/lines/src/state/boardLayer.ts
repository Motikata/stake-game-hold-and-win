import type { Container as PixiContainer } from 'pixi.js';

let _boardLayer: PixiContainer | null = null;
let _waiters: Array<(c: PixiContainer) => void> = [];
let _lastLog: 'set' | 'cleared' | null = null;

function unwrapPixiContainer(layerLike: any): PixiContainer | null {
    if (!layerLike) return null;
    if (typeof layerLike.toGlobal === 'function') return layerLike as PixiContainer;
    if (layerLike.container && typeof layerLike.container.toGlobal === 'function') {
        return layerLike.container as PixiContainer;
    }
    return null;
}

export function setBoardLayer(layerLike: any) {
    const candidate = unwrapPixiContainer(layerLike);
    if (!candidate) {
        if (_boardLayer !== null) {
            _boardLayer = null;
            if (_lastLog !== 'cleared') {
                console.log('[boardLayer] cleared');
                _lastLog = 'cleared';
            }
        }
        return;
    }

    _boardLayer = candidate;
    if (_waiters.length) {
        const w = _waiters.splice(0);
        w.forEach(fn => fn(candidate));
    }
    if (_lastLog !== 'set') {
        console.log('[boardLayer] set → has toGlobal?', typeof _boardLayer.toGlobal === 'function');
        _lastLog = 'set';
    }
}

export function getBoardLayer(): PixiContainer | null {
    return _boardLayer;
}

export async function waitForBoardLayer(timeoutMs = 5000): Promise<PixiContainer | null> {
    if (_boardLayer) return _boardLayer;
    return new Promise<PixiContainer | null>((resolve) => {
        const t = setTimeout(() => {
            // ако не е дошъл — връщаме null
            resolve(null);
        }, timeoutMs);
        _waiters.push((c) => {
            clearTimeout(t);
            resolve(c);
        });
    });
}
