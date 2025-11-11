<script lang="ts">
    import { onMount, onDestroy } from 'svelte'; // onMount/onDestroy са чистият път за еднократно абониране
    import {Container, getContextApp, Sprite} from "pixi-svelte";
    import { SignalService, type SignalServiceEvent } from "../../signals/SignalService";
    import { CollectToSunEffect, type CollectEffectData } from "./CollectToSunEffect";
    import {findContainerByName} from "../utils";

    // 1. Дефинираме променливата, която ще държи PIXI Container
    // (Не е необходимо да е реактивна, тъй като се сетва само веднъж)
    let stageContainer: Container | null = null;
    let sunAbove: Container | null = null;

    // 2. onFx: Функцията за обработка на сигнала (Остава същата)
    function onFx(e: SignalServiceEvent) {
        // !!! КЛЮЧ: Защита срещу ранно извикване (ако сигналът дойде преди onMount)
        if (!stageContainer) {
            console.warn("FX Ignored: Overlay Container is not initialized yet.");
            return;
        }

        console.log("FX Received. Container:", stageContainer);
         sunAbove = findContainerByName(stageContainer, 'sunAbove')
        console.log("sunAbove", sunAbove)
        let animationData = e.data as CollectEffectData
        animationData.toGlobal.x = sunAbove.x
        animationData.toGlobal.y = sunAbove.y
        // Извикваме ефекта с валидния контейнер
        const effect = new CollectToSunEffect(stageContainer, animationData);
        effect.play();
    }

    // 3. onMount: Използваме го за сигурна инициализация и абониране
    onMount(() => {
        const app = getContextApp().stateApp.pixiApplication;
        stageContainer = app?.stage ?? null;

        if (stageContainer) {
            // Абонираме се само, ако контейнерът е валиден
            SignalService.get().add("fx:collectToSun", onFx);
            console.log("SUCCESS: SignalService subscribed via onMount.");
        } else {
            console.error("CRITICAL: PIXI Application Stage not found.");
        }
    });

    // 4. onDestroy: Почистваме слушателя
    onDestroy(() => {
        // Премахваме слушателя, ако е бил добавен
        if (stageContainer) { // Проверяваме дали е бил инициализиран, за да чистим
            SignalService.get().remove("fx:collectToSun", onFx);
        }
    });

    // 5. ПРЕМАХВАМЕ НЕКОРЕКТНИЯ $effect и излишния onMount/tick
</script>