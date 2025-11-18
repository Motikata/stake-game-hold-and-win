import { Assets } from 'pixi.js';
// Внимавай с импортите, увери се, че versions съвпадат с package.json
import { Spine as Spine41 } from 'pixi-spine';
import { Spine as Spine42 } from '@esotericsoftware/spine-pixi';

export type SpineRuntime = '4.1' | '4.2';

// Връщаме 'any', за да не ни спира TypeScript за методи като .state.setAnimation
// Ако си мазохист, можеш да дефинираш общ Interface :D
type SpineAny = any;

type SpineCreateOptions41 = {
    runtime?: '4.1';
};

type SpineCreateOptions42 = {
    runtime: '4.2';
    // Направих ги optional. Ако липсват, ще ползваме 'name' като ключ
    skeleton?: string;
    atlas?: string;
    scale?: number;
};

export type SpineCreateOptions = SpineCreateOptions41 | SpineCreateOptions42;

export function spineCreate(name: string, options: SpineCreateOptions = {}): SpineAny {
    const runtime: SpineRuntime = options.runtime ?? '4.1';

    // ==============================
    // RUNTIME 4.1 (pixi-spine)
    // ==============================
    if (runtime === '4.1') {
        // Тук разчитаме, че Assets.load вече е минал и е парснал всичко
        const asset: any = Assets.get(name);

        if (!asset || !asset.spineData) {
            console.error(`[spineCreate 4.1] Asset "${name}" not found or missing spineData.`);
            return null; // Или хвърли грешка, по твой избор
        }

        return new Spine41(asset.spineData);
    }

    // ==============================
    // RUNTIME 4.2 (official esoterics)
    // ==============================

    // Cast-ваме опциите
    const opts42 = options as SpineCreateOptions42;
    const scale = opts42.scale ?? 1;

    // Логика: Ако не си подал конкретен скелет/атлас, ползваме 'name'
    // Това е удобно, ако си кръстил асетите с еднакви имена
    const skeletonKey = opts42.skeleton ?? name;
    const atlasKey = opts42.atlas ?? name; // Или може би `${name}.atlas` ако така ги пазиш

    // Spine42.from() е готин, защото може да работи и с keys, и с URL
    try {
        const spine = Spine42.from({
            skeleton: skeletonKey,
            atlas: atlasKey,
            scale: scale,
        });

        return spine;
    } catch (e) {
        console.error(`[spineCreate 4.2] Failed to create spine from "${skeletonKey}"`, e);
        return null;
    }
}